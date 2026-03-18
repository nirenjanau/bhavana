"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? "bg-stone-50/95 backdrop-blur-sm border-b border-stone-200"
          : "bg-transparent"
      }`}
    >
      <nav className="container-wide flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link
          href="/"
          className={`font-serif text-xl md:text-2xl font-light tracking-widest uppercase transition-colors ${
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

        {/* Client login CTA */}
        <div className="hidden md:block">
          <a
            href="http://localhost:3001"
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
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-px mb-1.5 transition-all ${
              scrolled || !isHome ? "bg-stone-900" : "bg-white"
            } ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-px mb-1.5 transition-all ${
              scrolled || !isHome ? "bg-stone-900" : "bg-white"
            } ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-px transition-all ${
              scrolled || !isHome ? "bg-stone-900" : "bg-white"
            } ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-stone-50 border-t border-stone-200 ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="container-wide py-6 space-y-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm tracking-widest uppercase text-stone-700 hover:text-stone-900"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href="http://localhost:3001"
              className="block text-sm tracking-widest uppercase text-stone-700 hover:text-stone-900"
            >
              Client Login
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
