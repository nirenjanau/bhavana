"use client";

import { useState } from "react";

// Studio WhatsApp — digits only, with country code
const WHATSAPP_NUMBER = "919387103562";

type FormFields = {
  name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  message: string;
};

function buildWhatsAppUrl(fields: FormFields): string {
  const datePart = fields.event_date
    ? new Date(fields.event_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const lines = [
    `Hi Bhavana Studio, I just submitted an enquiry through your website.`,
    ``,
    `*Name:* ${fields.name}`,
    `*Email:* ${fields.email}`,
    fields.phone ? `*Phone:* ${fields.phone}` : null,
    fields.event_type ? `*Event:* ${fields.event_type}` : null,
    datePart ? `*Date:* ${datePart}` : null,
    ``,
    `*Message:*`,
    fields.message,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
}

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const fields: FormFields = {
      name: raw.name ?? "",
      email: raw.email ?? "",
      phone: raw.phone ?? "",
      event_type: raw.event_type ?? "",
      event_date: raw.event_date ?? "",
      message: raw.message ?? "",
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      if (res.ok) {
        const url = buildWhatsAppUrl(fields);
        setWhatsappUrl(url);
        setStatus("success");
        form.reset();
        // Auto-open WhatsApp so the studio receives the full enquiry instantly
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full border-b border-stone-200 bg-transparent py-3 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-stone-900 transition-colors";

  if (status === "success") {
    return (
      <div className="space-y-8">
        {/* Success card */}
        <div className="p-6 bg-stone-100 border border-stone-200">
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Enquiry Submitted</p>
          <p className="font-serif text-2xl text-stone-900 italic mb-3">
            Thank you!
          </p>
          <p className="text-stone-500 text-sm leading-relaxed">
            WhatsApp has opened with your enquiry pre-filled — just hit{" "}
            <strong className="text-stone-700 font-medium">Send</strong> to deliver it to us instantly.
            If the window didn&apos;t open, use the button below.
          </p>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-[#25D366] text-white text-xs tracking-widest uppercase py-5 px-8 hover:bg-[#1ebe5d] transition-colors duration-300 w-full"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Open WhatsApp
        </a>

        <button
          onClick={() => setStatus("idle")}
          className="block text-xs tracking-widest uppercase text-stone-400 border-b border-stone-200 pb-0.5 hover:text-stone-900 hover:border-stone-900 transition-colors duration-300"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

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

      {status === "error" && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm">
          Something went wrong. Please reach out directly on{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            WhatsApp
          </a>
          .
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
