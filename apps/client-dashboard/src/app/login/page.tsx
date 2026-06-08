"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BackToHomeLink from "@/components/BackToHomeLink";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get("error");
    if (urlError === "CredentialsSignin") {
      setError("Invalid email or password. Please try again.");
    } else if (urlError) {
      setError("Sign in failed. Please try again.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value.trim();

    if (!email || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "API_UNREACHABLE") {
        setError("Cannot reach the server. Make sure the API is running on port 4000.");
      } else if (result.error === "API_ERROR") {
        setError("Server error during sign in. Check the API logs and try again.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setLoading(false);
      return;
    }

    const session = await getSession();
    router.push(session?.user.role === "admin" ? "/admin" : "/gallery");
    router.refresh();
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — image */}
      <div className="hidden lg:block relative">
        <Image
          src="/10-1.jpg.jpeg"
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
      <div className="flex items-center justify-center p-8 relative">
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
          <BackToHomeLink />
        </div>
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

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
