"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full border-b border-stone-200 bg-transparent py-3 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-stone-900 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Name *</label>
          <input name="name" required className={inputClass} placeholder="Your full name" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Email *</label>
          <input name="email" type="email" required className={inputClass} placeholder="your@email.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Phone</label>
          <input name="phone" type="tel" className={inputClass} placeholder="+91 xxxxx xxxxx" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Event Type</label>
          <select name="event_type" className={`${inputClass} cursor-pointer`}>
            <option value="">Select...</option>
            <option>Wedding</option>
            <option>Pre-wedding / Engagement</option>
            <option>Portrait</option>
            <option>Family</option>
            <option>Event / Corporate</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Event Date</label>
        <input name="event_date" type="date" className={inputClass} />
      </div>

      <div>
        <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Message *</label>
        <textarea
          name="message"
          required
          rows={5}
          className={`${inputClass} resize-none`}
          placeholder="Tell us about your vision, venue, and anything else we should know..."
        />
      </div>

      {status === "success" && (
        <div className="p-4 bg-stone-100 border border-stone-200 text-stone-600 text-sm">
          Thank you! We&apos;ll be in touch within 24 hours.
        </div>
      )}
      {status === "error" && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm">
          Something went wrong. Please email us directly at hello@bhavanastudio.com
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-stone-900 text-white text-xs tracking-widest uppercase py-5 hover:bg-stone-700 transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Enquiry"}
      </button>
    </form>
  );
}
