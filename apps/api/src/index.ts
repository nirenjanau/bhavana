import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth";
import galleryRouter from "./routes/gallery";
import adminRouter from "./routes/admin";
import portfolioRouter from "./routes/portfolio";
import contactRouter from "./routes/contact";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Security & Middleware ─────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      process.env.NEXTAUTH_URL ?? "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts, please try again later.",
});
app.use(limiter);

// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/admin", adminRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/contact", contactRouter);

// ─── Health check ──────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`✓ Bhavana API running on http://localhost:${PORT}`);
});

export default app;
