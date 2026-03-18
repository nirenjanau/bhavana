import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { queryOne } from "../db/client";
import { signToken, requireAuth } from "../middleware/auth";

const router = Router();

interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: "admin" | "client";
  is_active: boolean;
}

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await queryOne<User>(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [email]
    );

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }
);

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await queryOne<User>(
    "SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = $1",
    [req.user!.userId]
  );
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(user);
});

export default router;
