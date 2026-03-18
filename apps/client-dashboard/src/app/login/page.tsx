"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/gallery");
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — image */}
      <div className="hidden lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600"
          alt="Bhavana Studio"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-stone-950/50" />
        <div className="absolute bottom-12 left-12 right-12">
          <h1 className="font-serif text-4xl font-light text-white mb-3">
            Bhavana Studio
          </h1>
          <p className="text-white/60 text-sm">
            Your private gallery portal — view, like, and select your photos.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <h2 className="font-serif text-2xl font-light text-stone-900 tracking-widest uppercase mb-1">
              Bhavana Studio
            </h2>
            <p className="text-stone-400 text-sm">Client Gallery Portal</p>
          </div>

          <h3 className="text-xl font-medium text-stone-900 mb-8">
            Sign in to your gallery
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                Email address
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full border border-stone-200 bg-white px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full border border-stone-200 bg-white px-4 py-3 text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-100 p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white text-xs tracking-widest uppercase py-4 hover:bg-stone-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-stone-400 text-xs text-center">
            Having trouble?{" "}
            <a
              href="mailto:hello@bhavanastudio.com"
              className="text-stone-600 hover:text-stone-900 underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
