import { Router, Request, Response } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { requireAdmin } from "../middleware/auth";
import { query, queryOne } from "../db/client";
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
       COUNT(DISTINCT cpa.photo_id)                                              AS total_photos,
       COUNT(DISTINCT pi.photo_id) FILTER (WHERE pi.is_selected = true)         AS selected_photos
     FROM users u
     LEFT JOIN client_photo_access cpa ON cpa.client_id = u.id
     LEFT JOIN photo_interactions pi   ON pi.client_id = u.id
     WHERE u.role = 'client'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  return res.json(clients);
});

// POST /api/admin/clients
router.post(
  "/clients",
  [
    body("email").isEmail().normalizeEmail(),
    body("name").trim().notEmpty(),
    body("password").isLength({ min: 8 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;
    const existing = await queryOne("SELECT id FROM users WHERE email = $1", [email]);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const [client] = await query(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $2, $3, 'client')
       RETURNING id, email, name, role, created_at`,
      [email, name, password_hash]
    );
    return res.status(201).json(client);
  }
);

// GET /api/admin/clients/:id
router.get("/clients/:id", async (req: Request, res: Response) => {
  const client = await queryOne(
    "SELECT id, email, name, is_active, created_at FROM users WHERE id = $1 AND role = 'client'",
    [req.params.id]
  );
  if (!client) return res.status(404).json({ error: "Client not found" });

  const photos = await query(
    `SELECT
       p.id, p.filename, p.thumbnail_url, p.preview_url, p.original_url,
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
  const { name, is_active } = req.body;
  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name); }
  if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(is_active); }

  if (updates.length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  values.push(req.params.id);
  const [updated] = await query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx} RETURNING id, email, name, is_active`,
    values
  );
  return res.json(updated);
});

// ─── PHOTOS ───────────────────────────────────────────────────────────────────

// POST /api/admin/photos/upload
router.post(
  "/photos/upload",
  upload.array("photos", 20),
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const adminId = req.user!.userId;
    const albumId = req.body.album_id || null;
    const imageProcessingUrl = process.env.IMAGE_PROCESSING_URL ?? "http://image-processing:5000";

    const results = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append("image", blob, file.originalname);

        const processingRes = await fetch(`${imageProcessingUrl}/process`, {
          method: "POST",
          body: formData,
        });

        if (!processingRes.ok) {
          throw new Error("Image processing failed");
        }

        const processed = await processingRes.json() as {
          originalKey: string;
          previewKey: string;
          thumbnailKey: string;
          width: number;
          height: number;
          fileSize: number;
        };

        const [photo] = await query(
          `INSERT INTO photos
             (album_id, original_key, preview_key, thumbnail_key,
              original_url, preview_url, thumbnail_url,
              filename, mime_type, file_size, width, height, uploaded_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           RETURNING *`,
          [
            albumId,
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
        results.push(photo);
      } catch (err) {
        console.error(`Failed to process ${file.originalname}:`, err);
        results.push({ error: `Failed: ${file.originalname}` });
      }
    }

    return res.status(201).json({ uploaded: results });
  }
);

// POST /api/admin/photos/assign
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

  const values = photo_ids
    .map((pid, i) => `($1, $${i + 2})`)
    .join(", ");
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
       p.id AS photo_id, p.filename, p.thumbnail_url, p.preview_url,
       pi.updated_at AS selected_at
     FROM photo_interactions pi
     INNER JOIN users u  ON u.id = pi.client_id
     INNER JOIN photos p ON p.id = pi.photo_id
     WHERE pi.is_selected = true
     ORDER BY u.name, pi.updated_at DESC`
  );
  return res.json(selections);
});

// GET /api/admin/albums
router.get("/albums", async (_req: Request, res: Response) => {
  const albums = await query(
    `SELECT a.*, u.name AS client_name, COUNT(p.id) AS photo_count
     FROM albums a
     LEFT JOIN users u ON u.id = a.client_id
     LEFT JOIN photos p ON p.album_id = a.id
     GROUP BY a.id, u.name
     ORDER BY a.created_at DESC`
  );
  return res.json(albums);
});

// POST /api/admin/albums
router.post("/albums", async (req: Request, res: Response) => {
  const { client_id, title, description, shoot_date } = req.body;
  const [album] = await query(
    `INSERT INTO albums (client_id, title, description, shoot_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [client_id, title, description, shoot_date]
  );
  return res.status(201).json(album);
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
