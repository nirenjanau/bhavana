import { Router, Request, Response } from "express";
import archiver from "archiver";
import { requireClientOrAdmin } from "../middleware/auth";
import { query, queryOne } from "../db/client";
import { getPresignedDownloadUrl } from "../utils/s3";

const router = Router();
router.use(requireClientOrAdmin);

interface Photo {
  id: string;
  thumbnail_url: string;
  preview_url: string;
  original_url: string;
  original_key: string;
  filename: string;
  width: number;
  height: number;
  is_liked: boolean;
  is_selected: boolean;
}

// GET /api/gallery?filter=all|liked|selected&page=1&limit=24
// Flat view across all folders. Used by the existing "All photos" tab.
router.get("/", async (req: Request, res: Response) => {
  const clientId = req.user!.userId;
  const filter = (req.query.filter as string) ?? "all";
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 24);
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (filter === "liked") whereClause = "AND COALESCE(pi.is_liked, false) = true";
  if (filter === "selected") whereClause = "AND COALESCE(pi.is_selected, false) = true";

  const photos = await query<Photo>(
    `SELECT
       p.id,
       p.thumbnail_url,
       p.preview_url,
       p.original_url,
       p.original_key,
       p.filename,
       p.width,
       p.height,
       COALESCE(pi.is_liked, false)    AS is_liked,
       COALESCE(pi.is_selected, false) AS is_selected
     FROM photos p
     INNER JOIN client_photo_access cpa ON cpa.photo_id = p.id AND cpa.client_id = $1
     LEFT JOIN photo_interactions pi    ON pi.photo_id = p.id AND pi.client_id = $1
     WHERE 1=1 ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [clientId, limit, offset]
  );

  const [{ count }] = await query<{ count: string }>(
    `SELECT COUNT(*) FROM photos p
     INNER JOIN client_photo_access cpa ON cpa.photo_id = p.id AND cpa.client_id = $1
     LEFT JOIN photo_interactions pi    ON pi.photo_id = p.id AND pi.client_id = $1
     WHERE 1=1 ${whereClause}`,
    [clientId]
  );

  return res.json({
    photos,
    pagination: {
      page,
      limit,
      total: parseInt(count),
      pages: Math.ceil(parseInt(count) / limit),
    },
  });
});

// GET /api/gallery/tree?parent_id=...
// Drive-style listing: returns current folder, breadcrumb, child folders, and
// photos directly inside this folder. parent_id omitted = client's root.
router.get("/tree", async (req: Request, res: Response) => {
  const clientId = req.user!.userId;
  const parentId = (req.query.parent_id as string) || null;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(200, parseInt(req.query.limit as string) || 60);
  const offset = (page - 1) * limit;

  // If a parent_id is provided, verify the client owns that album.
  let current: { id: string; title: string; parent_album_id: string | null } | null = null;
  let breadcrumb: Array<{ id: string; title: string; parent_album_id: string | null }> = [];

  if (parentId) {
    const album = await queryOne<{
      id: string;
      title: string;
      parent_album_id: string | null;
      client_id: string;
    }>(
      "SELECT id, title, parent_album_id, client_id FROM albums WHERE id = $1",
      [parentId]
    );
    if (!album || album.client_id !== clientId) {
      return res.status(404).json({ error: "Folder not found" });
    }
    current = { id: album.id, title: album.title, parent_album_id: album.parent_album_id };

    breadcrumb = await query<{ id: string; title: string; parent_album_id: string | null }>(
      `WITH RECURSIVE chain AS (
         SELECT id, title, parent_album_id, 0 AS depth
         FROM albums WHERE id = $1
         UNION ALL
         SELECT a.id, a.title, a.parent_album_id, c.depth + 1
         FROM albums a INNER JOIN chain c ON c.parent_album_id = a.id
       )
       SELECT id, title, parent_album_id FROM chain ORDER BY depth DESC`,
      [parentId]
    );
  }

  const folders = await query(
    parentId
      ? `SELECT a.id, a.title, a.description, a.shoot_date, a.sort_order,
                (SELECT COUNT(*) FROM photos WHERE album_id = a.id) AS photo_count,
                (SELECT COUNT(*) FROM albums WHERE parent_album_id = a.id) AS folder_count
         FROM albums a
         WHERE a.client_id = $1 AND a.parent_album_id = $2
         ORDER BY a.sort_order ASC, a.created_at DESC`
      : `SELECT a.id, a.title, a.description, a.shoot_date, a.sort_order,
                (SELECT COUNT(*) FROM photos WHERE album_id = a.id) AS photo_count,
                (SELECT COUNT(*) FROM albums WHERE parent_album_id = a.id) AS folder_count
         FROM albums a
         WHERE a.client_id = $1 AND a.parent_album_id IS NULL
         ORDER BY a.sort_order ASC, a.created_at DESC`,
    parentId ? [clientId, parentId] : [clientId]
  );

  const albumFilter = parentId ? "p.album_id = $2" : "p.album_id IS NULL";
  const photoParams: unknown[] = parentId
    ? [clientId, parentId, limit, offset]
    : [clientId, limit, offset];
  const limitIdx = parentId ? "$3" : "$2";
  const offsetIdx = parentId ? "$4" : "$3";

  const photos = await query<Photo>(
    `SELECT
       p.id,
       p.thumbnail_url, p.preview_url, p.original_url, p.original_key,
       p.filename, p.width, p.height,
       COALESCE(pi.is_liked, false)    AS is_liked,
       COALESCE(pi.is_selected, false) AS is_selected
     FROM photos p
     INNER JOIN client_photo_access cpa ON cpa.photo_id = p.id AND cpa.client_id = $1
     LEFT JOIN photo_interactions pi    ON pi.photo_id = p.id AND pi.client_id = $1
     WHERE ${albumFilter}
     ORDER BY p.created_at DESC
     LIMIT ${limitIdx} OFFSET ${offsetIdx}`,
    photoParams
  );

  const [{ count }] = await query<{ count: string }>(
    `SELECT COUNT(*) FROM photos p
     INNER JOIN client_photo_access cpa ON cpa.photo_id = p.id AND cpa.client_id = $1
     WHERE ${albumFilter}`,
    parentId ? [clientId, parentId] : [clientId]
  );

  return res.json({
    current,
    breadcrumb,
    folders,
    photos,
    pagination: {
      page,
      limit,
      total: parseInt(count),
      pages: Math.ceil(parseInt(count) / limit),
    },
  });
});

// POST /api/gallery/photos/:id/like
router.post("/photos/:id/like", async (req: Request, res: Response) => {
  const clientId = req.user!.userId;
  const photoId = req.params.id;

  const access = await queryOne(
    "SELECT 1 FROM client_photo_access WHERE client_id = $1 AND photo_id = $2",
    [clientId, photoId]
  );
  if (!access) return res.status(403).json({ error: "Access denied" });

  const existing = await queryOne<{ is_liked: boolean }>(
    "SELECT is_liked FROM photo_interactions WHERE client_id = $1 AND photo_id = $2",
    [clientId, photoId]
  );

  let isLiked: boolean;
  if (existing) {
    isLiked = !existing.is_liked;
    await query(
      "UPDATE photo_interactions SET is_liked = $3 WHERE client_id = $1 AND photo_id = $2",
      [clientId, photoId, isLiked]
    );
  } else {
    isLiked = true;
    await query(
      "INSERT INTO photo_interactions (client_id, photo_id, is_liked) VALUES ($1, $2, $3)",
      [clientId, photoId, isLiked]
    );
  }

  return res.json({ is_liked: isLiked });
});

// POST /api/gallery/photos/:id/select
router.post("/photos/:id/select", async (req: Request, res: Response) => {
  const clientId = req.user!.userId;
  const photoId = req.params.id;

  const access = await queryOne(
    "SELECT 1 FROM client_photo_access WHERE client_id = $1 AND photo_id = $2",
    [clientId, photoId]
  );
  if (!access) return res.status(403).json({ error: "Access denied" });

  const existing = await queryOne<{ is_selected: boolean }>(
    "SELECT is_selected FROM photo_interactions WHERE client_id = $1 AND photo_id = $2",
    [clientId, photoId]
  );

  let isSelected: boolean;
  if (existing) {
    isSelected = !existing.is_selected;
    await query(
      "UPDATE photo_interactions SET is_selected = $3 WHERE client_id = $1 AND photo_id = $2",
      [clientId, photoId, isSelected]
    );
  } else {
    isSelected = true;
    await query(
      "INSERT INTO photo_interactions (client_id, photo_id, is_selected) VALUES ($1, $2, $3)",
      [clientId, photoId, isSelected]
    );
  }

  return res.json({ is_selected: isSelected });
});

// GET /api/gallery/download/:id
router.get("/download/:id", async (req: Request, res: Response) => {
  const clientId = req.user!.userId;
  const photoId = req.params.id;

  const photo = await queryOne<{ original_key: string; filename: string }>(
    `SELECT p.original_key, p.filename
     FROM photos p
     INNER JOIN client_photo_access cpa ON cpa.photo_id = p.id
     WHERE p.id = $1 AND cpa.client_id = $2`,
    [photoId, clientId]
  );
  if (!photo) return res.status(404).json({ error: "Photo not found" });

  const url = await getPresignedDownloadUrl(photo.original_key, 900);
  return res.json({ url, filename: photo.filename });
});

// POST /api/gallery/download/bulk
router.post("/download/bulk", async (req: Request, res: Response) => {
  const clientId = req.user!.userId;
  const { photoIds } = req.body as { photoIds?: string[] };

  let photos: Array<{ original_key: string; filename: string }>;

  if (photoIds && photoIds.length > 0) {
    photos = await query<{ original_key: string; filename: string }>(
      `SELECT p.original_key, p.filename
       FROM photos p
       INNER JOIN client_photo_access cpa ON cpa.photo_id = p.id
       WHERE p.id = ANY($1::uuid[]) AND cpa.client_id = $2`,
      [photoIds, clientId]
    );
  } else {
    photos = await query<{ original_key: string; filename: string }>(
      `SELECT p.original_key, p.filename
       FROM photos p
       INNER JOIN client_photo_access cpa ON cpa.photo_id = p.id
       INNER JOIN photo_interactions pi ON pi.photo_id = p.id AND pi.client_id = $1
       WHERE cpa.client_id = $1 AND pi.is_selected = true`,
      [clientId]
    );
  }

  if (photos.length === 0) {
    return res.status(400).json({ error: "No photos to download" });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="bhavana-gallery.zip"'
  );

  const archive = archiver("zip", { zlib: { level: 6 } });
  archive.pipe(res);

  for (const photo of photos) {
    const url = await getPresignedDownloadUrl(photo.original_key, 300);
    const response = await fetch(url);
    if (response.ok && response.body) {
      const { Readable } = await import("stream");
      const nodeStream = Readable.fromWeb(response.body as import("stream/web").ReadableStream);
      archive.append(nodeStream, { name: photo.filename });
    }
  }

  await archive.finalize();
  return res;
});

// GET /api/gallery/stats
router.get("/stats", async (req: Request, res: Response) => {
  const clientId = req.user!.userId;
  const [stats] = await query<{
    total: string;
    liked: string;
    selected: string;
  }>(
    `SELECT
       COUNT(cpa.photo_id)                                                          AS total,
       COUNT(pi.photo_id) FILTER (WHERE COALESCE(pi.is_liked, false) = true)    AS liked,
       COUNT(pi.photo_id) FILTER (WHERE COALESCE(pi.is_selected, false) = true) AS selected
     FROM client_photo_access cpa
     LEFT JOIN photo_interactions pi ON pi.photo_id = cpa.photo_id AND pi.client_id = $1
     WHERE cpa.client_id = $1`,
    [clientId]
  );
  return res.json({
    total: parseInt(stats.total),
    liked: parseInt(stats.liked),
    selected: parseInt(stats.selected),
  });
});

export default router;
