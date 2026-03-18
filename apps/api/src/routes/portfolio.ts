import { Router, Request, Response } from "express";
import { query } from "../db/client";

const router = Router();

// GET /api/portfolio
router.get("/", async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const featuredOnly = req.query.featured === "true";

  let whereClause = "WHERE is_active = true";
  const params: unknown[] = [];
  let idx = 1;

  if (category) {
    whereClause += ` AND category = $${idx++}`;
    params.push(category);
  }
  if (featuredOnly) {
    whereClause += " AND is_featured = true";
  }

  const items = await query(
    `SELECT id, title, category, description, photo_url, is_featured, sort_order
     FROM portfolio_items
     ${whereClause}
     ORDER BY sort_order ASC, created_at DESC`,
    params
  );
  return res.json(items);
});

// GET /api/portfolio/categories
router.get("/categories", async (_req: Request, res: Response) => {
  const cats = await query<{ category: string; count: string }>(
    `SELECT category, COUNT(*) AS count
     FROM portfolio_items
     WHERE is_active = true
     GROUP BY category
     ORDER BY category`
  );
  return res.json(cats);
});

export default router;
