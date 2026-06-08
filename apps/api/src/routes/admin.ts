import { Router, Request, Response } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { requireAdmin } from "../middleware/auth";
import { query, queryOne, withTransaction } from "../db/client";
import { uploadBuffer, getPublicUrl } from "../utils/s3";

const router = Router();
router.use(requireAdmin);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 20 },
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

// GET /api/admin/clients
router.get("/clients", async (_req: Request, res: Response) => {
  const clients = await query(
    `SELECT
       u.id, u.email, u.name, u.is_active, u.created_at,
       u.storage_quota_bytes,
       u.storage_used_bytes,
       COUNT(DISTINCT cpa.photo_id)                                             AS total_photos,
       COUNT(DISTINCT pi.photo_id) FILTER (WHERE pi.is_selected = true)         AS selected_photos,
       COUNT(DISTINCT pi.photo_id) FILTER (WHERE pi.is_liked = true)            AS liked_photos
     FROM users u
     LEFT JOIN client_photo_access cpa ON cpa.client_id = u.id
     LEFT JOIN photo_interactions pi   ON pi.client_id = u.id
     WHERE u.role = 'client'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  return res.json(clients);
});

// DELETE /api/admin/clients/:id  — permanently delete a client + all their photos & folders
router.delete("/clients/:id", async (req: Request, res: Response) => {
  const exists = await queryOne("SELECT id FROM users WHERE id = $1 AND role = 'client'", [req.params.id]);
  if (!exists) return res.status(404).json({ error: "Client not found" });
  // CASCADE on FK handles albums, photos, interactions, and access rows
  await query("DELETE FROM users WHERE id = $1", [req.params.id]);
  return res.json({ deleted: true });
});

// POST /api/admin/clients/:id/password  — reset a client's password
router.post("/clients/:id/password", async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  const exists = await queryOne("SELECT id FROM users WHERE id = $1 AND role = 'client'", [req.params.id]);
  if (!exists) return res.status(404).json({ error: "Client not found" });
  const password_hash = await bcrypt.hash(password, 12);
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [password_hash, req.params.id]);
  return res.json({ ok: true });
});

// POST /api/admin/clients
router.post(
  "/clients",
  [
    body("email").isEmail().toLowerCase().trim(),
    body("name").trim().notEmpty(),
    body("password").isLength({ min: 8 }),
    body("storage_quota_gb").optional().isInt({ min: 1, max: 10000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password, storage_quota_gb } = req.body as {
      email: string;
      name: string;
      password: string;
      storage_quota_gb?: number;
    };
    const existing = await queryOne("SELECT id FROM users WHERE email = $1", [email]);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const quotaBytes = storage_quota_gb
      ? BigInt(storage_quota_gb) * 1024n * 1024n * 1024n
      : null;

    const [client] = await query(
      `INSERT INTO users (email, name, password_hash, role, storage_quota_bytes)
       VALUES ($1, $2, $3, 'client', COALESCE($4, 32212254720))
       RETURNING id, email, name, role, storage_quota_bytes, storage_used_bytes, created_at`,
      [email, name, password_hash, quotaBytes ? quotaBytes.toString() : null]
    );
    return res.status(201).json(client);
  }
);

// GET /api/admin/clients/:id
router.get("/clients/:id", async (req: Request, res: Response) => {
  const client = await queryOne(
    `SELECT id, email, name, is_active, created_at,
            storage_quota_bytes, storage_used_bytes
     FROM users
     WHERE id = $1 AND role = 'client'`,
    [req.params.id]
  );
  if (!client) return res.status(404).json({ error: "Client not found" });

  const photos = await query(
    `SELECT
       p.id, p.filename, p.thumbnail_url, p.preview_url, p.original_url,
       p.album_id, p.file_size,
       COALESCE(pi.is_liked, false)    AS is_liked,
       COALESCE(pi.is_selected, false) AS is_selected
     FROM photos p
     INNER JOIN client_photo_access cpa ON cpa.photo_id = p.id
     LEFT JOIN photo_interactions pi    ON pi.photo_id = p.id AND pi.client_id = $1
     WHERE cpa.client_id = $1
     ORDER BY p.created_at DESC`,
    [req.params.id]
  );

  return res.json({ client, photos });
});

// PATCH /api/admin/clients/:id
router.patch("/clients/:id", async (req: Request, res: Response) => {
  const { name, is_active, storage_quota_gb } = req.body as {
    name?: string;
    is_active?: boolean;
    storage_quota_gb?: number;
  };
  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
  if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(is_active); }
  if (storage_quota_gb !== undefined) {
    const quotaBytes = BigInt(storage_quota_gb) * 1024n * 1024n * 1024n;
    updates.push(`storage_quota_bytes = $${idx++}`);
    values.push(quotaBytes.toString());
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  values.push(req.params.id);
  const [updated] = await query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx}
     RETURNING id, email, name, is_active, storage_quota_bytes, storage_used_bytes`,
    values
  );
  return res.json(updated);
});

// GET /api/admin/clients/:id/storage
router.get("/clients/:id/storage", async (req: Request, res: Response) => {
  const client = await queryOne<{
    storage_quota_bytes: string;
    storage_used_bytes: string;
  }>(
    "SELECT storage_quota_bytes, storage_used_bytes FROM users WHERE id = $1 AND role = 'client'",
    [req.params.id]
  );
  if (!client) return res.status(404).json({ error: "Client not found" });

  const [{ photo_count, folder_count }] = await query<{
    photo_count: string;
    folder_count: string;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM photos WHERE client_id = $1) AS photo_count,
       (SELECT COUNT(*) FROM albums WHERE client_id = $1) AS folder_count`,
    [req.params.id]
  );

  return res.json({
    quota_bytes: Number(client.storage_quota_bytes),
    used_bytes: Number(client.storage_used_bytes),
    photo_count: parseInt(photo_count),
    folder_count: parseInt(folder_count),
  });
});

// ─── ALBUMS (folders) ─────────────────────────────────────────────────────────

// GET /api/admin/albums?client_id=&parent_id=
// List folders at a single level (Drive-style). If parent_id omitted, returns
// root-level folders for the client.
router.get("/albums", async (req: Request, res: Response) => {
  const { client_id, parent_id } = req.query as {
    client_id?: string;
    parent_id?: string;
  };

  if (!client_id) {
    // Legacy: list all albums, used by the old overview panel.
    const albums = await query(
      `SELECT a.*, u.name AS client_name, COUNT(p.id) AS photo_count
       FROM albums a
       LEFT JOIN users u ON u.id = a.client_id
       LEFT JOIN photos p ON p.album_id = a.id
       GROUP BY a.id, u.name
       ORDER BY a.created_at DESC`
    );
    return res.json(albums);
  }

  const parentFilter = parent_id ? "a.parent_album_id = $2" : "a.parent_album_id IS NULL";
  const params: unknown[] = parent_id ? [client_id, parent_id] : [client_id];

  const albums = await query(
    `SELECT a.*,
            (SELECT COUNT(*) FROM photos WHERE album_id = a.id) AS photo_count,
            (SELECT COUNT(*) FROM albums WHERE parent_album_id = a.id) AS folder_count
     FROM albums a
     WHERE a.client_id = $1 AND ${parentFilter}
     ORDER BY a.sort_order ASC, a.created_at DESC`,
    params
  );
  return res.json(albums);
});

// POST /api/admin/albums  – create a folder (optionally nested under parent)
router.post("/albums", async (req: Request, res: Response) => {
  const { client_id, title, description, shoot_date, parent_album_id } = req.body as {
    client_id: string;
    title: string;
    description?: string;
    shoot_date?: string | null;
    parent_album_id?: string | null;
  };

  if (!client_id || !title) {
    return res.status(400).json({ error: "client_id and title are required" });
  }

  // If a parent is given, make sure it belongs to the same client (prevent
  // cross-client folder nesting).
  if (parent_album_id) {
    const parent = await queryOne(
      "SELECT client_id FROM albums WHERE id = $1",
      [parent_album_id]
    );
    if (!parent || parent.client_id !== client_id) {
      return res.status(400).json({ error: "Invalid parent_album_id" });
    }
  }

  const [album] = await query(
    `INSERT INTO albums (client_id, title, description, shoot_date, parent_album_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [client_id, title, description ?? null, shoot_date ?? null, parent_album_id ?? null]
  );
  return res.status(201).json(album);
});

// PATCH /api/admin/albums/:id  – rename / move / re-order
router.patch("/albums/:id", async (req: Request, res: Response) => {
  const { title, description, shoot_date, parent_album_id, sort_order } = req.body as {
    title?: string;
    description?: string | null;
    shoot_date?: string | null;
    parent_album_id?: string | null;
    sort_order?: number;
  };

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title); }
  if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
  if (shoot_date !== undefined) { updates.push(`shoot_date = $${idx++}`); values.push(shoot_date); }
  if (parent_album_id !== undefined) {
    // Prevent self-reference.
    if (parent_album_id === req.params.id) {
      return res.status(400).json({ error: "Folder cannot be its own parent" });
    }
    updates.push(`parent_album_id = $${idx++}`);
    values.push(parent_album_id);
  }
  if (sort_order !== undefined) { updates.push(`sort_order = $${idx++}`); values.push(sort_order); }

  if (updates.length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  values.push(req.params.id);
  const [updated] = await query(
    `UPDATE albums SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.json(updated);
});

// DELETE /api/admin/albums/:id
// Cascade-deletes sub-folders via FK. Photos keep existing (album_id → NULL via
// their own FK) so nothing is lost accidentally. Use /photos delete for removal.
router.delete("/albums/:id", async (req: Request, res: Response) => {
  await query("DELETE FROM albums WHERE id = $1", [req.params.id]);
  return res.json({ deleted: true });
});

// GET /api/admin/albums/:id/breadcrumb  – ancestor chain from root → this album
router.get("/albums/:id/breadcrumb", async (req: Request, res: Response) => {
  const rows = await query<{
    id: string;
    title: string;
    parent_album_id: string | null;
    client_id: string;
  }>(
    `WITH RECURSIVE chain AS (
       SELECT id, title, parent_album_id, client_id, 0 AS depth
       FROM albums WHERE id = $1
       UNION ALL
       SELECT a.id, a.title, a.parent_album_id, a.client_id, c.depth + 1
       FROM albums a INNER JOIN chain c ON c.parent_album_id = a.id
     )
     SELECT id, title, parent_album_id, client_id FROM chain ORDER BY depth DESC`,
    [req.params.id]
  );
  return res.json(rows);
});

// ─── PHOTOS ───────────────────────────────────────────────────────────────────

// POST /api/admin/photos/upload  – multipart, field "photos"
// Accepts client_id (required for quota), album_id (optional folder).
// In a single transaction: inserts photo row → creates access → increments
// client's storage_used_bytes. Rejects the whole upload if it would exceed quota.
router.post(
  "/photos/upload",
  upload.array("photos", 20),
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const adminId = req.user!.userId;
    const clientId = (req.body.client_id as string) || null;
    const albumId = (req.body.album_id as string) || null;
    const imageProcessingUrl = process.env.IMAGE_PROCESSING_URL ?? "http://image-processing:5000";

    if (!clientId) {
      return res.status(400).json({ error: "client_id is required" });
    }

    // Sanity-check client + folder up-front.
    const client = await queryOne<{
      storage_quota_bytes: string;
      storage_used_bytes: string;
    }>(
      "SELECT storage_quota_bytes, storage_used_bytes FROM users WHERE id = $1 AND role = 'client' AND is_active = true",
      [clientId]
    );
    if (!client) {
      return res.status(404).json({ error: "Client not found or inactive" });
    }

    if (albumId) {
      const album = await queryOne(
        "SELECT client_id FROM albums WHERE id = $1",
        [albumId]
      );
      if (!album || album.client_id !== clientId) {
        return res.status(400).json({ error: "Folder does not belong to this client" });
      }
    }

    const quota = BigInt(client.storage_quota_bytes);
    let used = BigInt(client.storage_used_bytes);
    const uploaded: unknown[] = [];
    const errors: unknown[] = [];

    for (const file of files) {
      try {
        // Ask the image-processing service to handle all three variants.
        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append("image", blob, file.originalname);

        const processingRes = await fetch(`${imageProcessingUrl}/process`, {
          method: "POST",
          body: formData,
        });
        if (!processingRes.ok) throw new Error("Image processing failed");

        const processed = (await processingRes.json()) as {
          originalKey: string;
          previewKey: string;
          thumbnailKey: string;
          width: number;
          height: number;
          fileSize: number;
        };

        const size = BigInt(processed.fileSize);
        if (used + size > quota) {
          errors.push({
            filename: file.originalname,
            error: "Client storage quota exceeded",
          });
          continue;
        }

        const photo = await withTransaction(async (tx) => {
          const [row] = await tx.query(
            `INSERT INTO photos
               (album_id, client_id, original_key, preview_key, thumbnail_key,
                original_url, preview_url, thumbnail_url,
                filename, mime_type, file_size, width, height, uploaded_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
             RETURNING *`,
            [
              albumId,
              clientId,
              processed.originalKey,
              processed.previewKey,
              processed.thumbnailKey,
              getPublicUrl(processed.originalKey),
              getPublicUrl(processed.previewKey),
              getPublicUrl(processed.thumbnailKey),
              file.originalname,
              file.mimetype,
              processed.fileSize,
              processed.width,
              processed.height,
              adminId,
            ]
          );

          await tx.query(
            `INSERT INTO client_photo_access (client_id, photo_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [clientId, (row as { id: string }).id]
          );

          await tx.query(
            "UPDATE users SET storage_used_bytes = storage_used_bytes + $1 WHERE id = $2",
            [processed.fileSize, clientId]
          );

          return row;
        });

        used += size;
        uploaded.push(photo);
      } catch (err) {
        console.error(`Failed to process ${file.originalname}:`, err);
        errors.push({
          filename: file.originalname,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    return res.status(201).json({
      uploaded,
      errors,
      storage: {
        quota_bytes: Number(quota),
        used_bytes: Number(used),
      },
    });
  }
);

// POST /api/admin/photos/assign  (legacy — still supported for ad-hoc assignments)
router.post("/photos/assign", async (req: Request, res: Response) => {
  const { client_id, photo_ids } = req.body as {
    client_id: string;
    photo_ids: string[];
  };

  if (!client_id || !Array.isArray(photo_ids) || photo_ids.length === 0) {
    return res.status(400).json({ error: "client_id and photo_ids are required" });
  }

  const client = await queryOne(
    "SELECT id FROM users WHERE id = $1 AND role = 'client'",
    [client_id]
  );
  if (!client) return res.status(404).json({ error: "Client not found" });

  const values = photo_ids.map((_pid, i) => `($1, $${i + 2})`).join(", ");
  await query(
    `INSERT INTO client_photo_access (client_id, photo_id)
     VALUES ${values}
     ON CONFLICT DO NOTHING`,
    [client_id, ...photo_ids]
  );

  return res.json({ assigned: photo_ids.length });
});

// DELETE /api/admin/photos/assign
router.delete("/photos/assign", async (req: Request, res: Response) => {
  const { client_id, photo_ids } = req.body as {
    client_id: string;
    photo_ids: string[];
  };
  await query(
    "DELETE FROM client_photo_access WHERE client_id = $1 AND photo_id = ANY($2::uuid[])",
    [client_id, photo_ids]
  );
  return res.json({ removed: photo_ids.length });
});

// DELETE /api/admin/photos/:id  – hard-delete a photo + refund quota
router.delete("/photos/:id", async (req: Request, res: Response) => {
  await withTransaction(async (tx) => {
    const photo = await tx.queryOne<{ client_id: string | null; file_size: number }>(
      "SELECT client_id, file_size FROM photos WHERE id = $1",
      [req.params.id]
    );
    if (photo && photo.client_id) {
      await tx.query(
        "UPDATE users SET storage_used_bytes = GREATEST(0, storage_used_bytes - $1) WHERE id = $2",
        [photo.file_size, photo.client_id]
      );
    }
    await tx.query("DELETE FROM photos WHERE id = $1", [req.params.id]);
  });
  return res.json({ deleted: true });
});

// GET /api/admin/photos
router.get("/photos", async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 48);
  const offset = (page - 1) * limit;

  const photos = await query(
    `SELECT p.*, u.name AS uploader_name,
            COUNT(cpa.client_id) AS assigned_clients
     FROM photos p
     LEFT JOIN users u ON u.id = p.uploaded_by
     LEFT JOIN client_photo_access cpa ON cpa.photo_id = p.id
     GROUP BY p.id, u.name
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return res.json(photos);
});

// GET /api/admin/selections  – all client selected photos
router.get("/selections", async (_req: Request, res: Response) => {
  const selections = await query(
    `SELECT
       u.id AS client_id, u.name AS client_name, u.email AS client_email,
       p.id AS photo_id, p.filename, p.thumbnail_url, p.preview_url, p.original_url,
       p.original_key,
       pi.updated_at AS selected_at
     FROM photo_interactions pi
     INNER JOIN users u  ON u.id = pi.client_id
     INNER JOIN photos p ON p.id = pi.photo_id
     WHERE pi.is_selected = true
     ORDER BY u.name, pi.updated_at DESC`
  );
  return res.json(selections);
});

// GET /api/admin/likes  – all client liked photos
router.get("/likes", async (_req: Request, res: Response) => {
  const likes = await query(
    `SELECT
       u.id AS client_id, u.name AS client_name, u.email AS client_email,
       p.id AS photo_id, p.filename,
       pi.updated_at AS liked_at
     FROM photo_interactions pi
     INNER JOIN users u  ON u.id = pi.client_id
     INNER JOIN photos p ON p.id = pi.photo_id
     WHERE pi.is_liked = true
     ORDER BY u.name, pi.updated_at DESC`
  );
  return res.json(likes);
});

// POST /api/admin/portfolio
router.post("/portfolio", upload.single("photo"), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Photo required" });

  const { title, category, description, is_featured, sort_order } = req.body;
  const key = `portfolio/${Date.now()}-${file.originalname}`;
  const url = await uploadBuffer(key, file.buffer, file.mimetype);

  const [item] = await query(
    `INSERT INTO portfolio_items (title, category, description, photo_key, photo_url, is_featured, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [title, category, description, key, url, is_featured === "true", parseInt(sort_order) || 0]
  );
  return res.status(201).json(item);
});

export default router;
