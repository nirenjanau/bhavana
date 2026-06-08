import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const maintenance = process.env.MAINTENANCE_MODE === "true";

  if (!maintenance) return NextResponse.next();

  // Already on the maintenance page — let it through to avoid redirect loop
  if (request.nextUrl.pathname === "/maintenance") return NextResponse.next();

  // Everything else → maintenance page
  return NextResponse.rewrite(new URL("/maintenance", request.url));
}

export const config = {
  // Run on all pages except static files, images, and _next internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.webp|.*\\.svg|.*\\.ico).*)"],
};
