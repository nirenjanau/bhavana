import type { Metadata } from "next";
import ContactForm from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Bhavana Studio to book your photography session.",
};

export default function ContactPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-stone-50">
        <div className="container-wide">
          <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-4">Say Hello</p>
          <h1 className="text-display text-6xl md:text-8xl text-stone-900">Contact</h1>
        </div>
      </div>

      <section className="py-16 md:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <div>
              <h2 className="text-display text-4xl text-stone-900 mb-8">
                Let&apos;s create something beautiful together
              </h2>
              <p className="text-stone-500 leading-relaxed mb-12">
                Whether you&apos;re planning a wedding, want a portrait session, or simply have a question,
                we&apos;d love to hear from you. We respond to all enquiries within 24 hours.
              </p>

              <div className="space-y-6">
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Email</p>
                  <a href="mailto:bhavanastudio@gmail.com" className="text-stone-900 hover:text-stone-500 transition-colors">
                    bhavanastudio@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Phone</p>
                  <a href="tel:+919876543210" className="text-stone-900 hover:text-stone-500 transition-colors">
                    +91 93871 03562
                  </a>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Studio</p>
                  <p className="text-stone-900">
                    Sreedevi Arcade<br />
                    Kairali Junction, Mammyoor<br />
                    Guruvayoor, Kerala, India
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Availability</p>
                  <p className="text-stone-500 text-sm">
                    Bookings are filling fast for 2025–2026. We recommend reaching out as early as possible to check availability for your date.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
