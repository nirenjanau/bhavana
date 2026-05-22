"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background image / overlay */}
      <div className="absolute inset-0">
        <Image
          src="/hero-temple-wedding-night.jpg"
          alt="Temple wedding ceremony at night"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/30 to-stone-950/70" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end pb-12 md:pb-20 lg:pb-24 container-wide">
        <div className="max-w-3xl">
          <p className="text-white/60 text-xs tracking-ultra-wide uppercase mb-4 md:mb-6 animate-fade-up">
            Fine Art Photography · Guruvayoor
          </p>
          <h1 className="text-display text-white text-5xl md:text-7xl lg:text-9xl mb-6 md:mb-8 leading-[0.95] animate-fade-up">
            Capturing
            <br />
            <em className="italic">Timeless</em>
            <br />
            Moments
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 animate-fade-up">
            <Link
              href="/portfolio"
              className="inline-block text-center border border-white text-white text-xs tracking-widest uppercase px-6 py-4 md:px-8 hover:bg-white hover:text-stone-900 transition-all duration-300"
            >
              View Portfolio
            </Link>
            <Link
              href="/contact"
              className="inline-block text-center bg-white text-stone-900 text-xs tracking-widest uppercase px-6 py-4 md:px-8 hover:bg-stone-100 transition-all duration-300"
            >
              Book a Session
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden md:flex absolute bottom-8 right-8 flex-col items-center gap-2">
          <span className="text-white/40 text-xs tracking-widest uppercase rotate-90 origin-center">
            Scroll
          </span>
          <div className="w-px h-12 bg-white/20 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/60 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
