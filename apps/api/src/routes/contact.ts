import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { query } from "../db/client";

const router = Router();

// POST /api/contact
router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("message").trim().isLength({ min: 10 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, event_type, event_date, message } = req.body;
    const [submission] = await query(
      `INSERT INTO contact_submissions (name, email, phone, event_type, event_date, message)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, created_at`,
      [name, email, phone || null, event_type || null, event_date || null, message]
    );
    return res.status(201).json({ success: true, id: submission.id });
  }
);

export default router;
