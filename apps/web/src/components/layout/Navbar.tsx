"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLIENT_PORTAL_URL } from "@/lib/site";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  // { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <>
      {/* Mobile menu backdrop overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-stone-950/20 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? "bg-stone-50/95 backdrop-blur-sm border-b border-stone-200"
            : "bg-transparent"
        }`}
      >
        <nav className="container-wide flex items-center justify-between h-14 md:h-20">
        {/* Logo */}
        <Link
          href="/"
          className={`font-serif text-lg md:text-2xl font-light tracking-widest uppercase transition-colors ${
            scrolled || !isHome ? "text-stone-900" : "text-white"
          }`}
        >
          Bhavana Studio
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-xs tracking-widest uppercase font-medium transition-colors hover-underline ${
                  pathname === link.href
                    ? scrolled || !isHome
                      ? "text-stone-900"
                      : "text-white"
                    : scrolled || !isHome
                    ? "text-stone-500 hover:text-stone-900"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <a
            href={CLIENT_PORTAL_URL}
            className={`text-xs tracking-widest uppercase font-medium border px-5 py-2.5 transition-all ${
              scrolled || !isHome
                ? "border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white"
                : "border-white text-white hover:bg-white hover:text-stone-900"
            }`}
          >
            Client Login
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-3 -mr-3"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 mb-1 transition-all ${
              scrolled || !isHome ? "bg-stone-900" : "bg-white"
            } ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 mb-1 transition-all ${
              scrolled || !isHome ? "bg-stone-900" : "bg-white"
            } ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 transition-all ${
              scrolled || !isHome ? "bg-stone-900" : "bg-white"
            } ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-stone-50 ${
          menuOpen ? "max-h-96 border-t border-stone-200" : "max-h-0"
        }`}
      >
        <nav className="py-8 px-5">
          <ul className="space-y-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block text-base tracking-wider uppercase transition-colors ${
                    pathname === link.href
                      ? "text-stone-900 font-medium"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={CLIENT_PORTAL_URL}
                onClick={() => setMenuOpen(false)}
                className="block text-base tracking-wider uppercase text-stone-600 hover:text-stone-900 transition-colors"
              >
                Client Login
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    </>
  );
}
