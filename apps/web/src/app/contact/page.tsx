import type { Metadata } from "next";
import ContactForm from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Bhavana Studio to book your photography session.",
};

export default function ContactPage() {
  return (
    <>
      <div className="pt-24 md:pt-32 pb-12 md:pb-16 bg-stone-50">
        <div className="container-wide">
          <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-3 md:mb-4">Say Hello</p>
          <h1 className="text-display text-5xl md:text-7xl lg:text-8xl text-stone-900 leading-tight">Contact</h1>
        </div>
      </div>

      <section className="py-12 md:py-20 lg:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
            {/* Info */}
            <div>
              <h2 className="text-display text-3xl md:text-4xl text-stone-900 mb-6 md:mb-8 leading-tight">
                Let&apos;s create something beautiful together
              </h2>
              <p className="text-stone-500 leading-relaxed text-sm md:text-base mb-10 md:mb-12">
                Whether you&apos;re planning a wedding, want a portrait session, or simply have a question,
                we&apos;d love to hear from you. We respond to all enquiries within 24 hours.
              </p>

              <div className="space-y-6 md:space-y-8">
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1.5">Email</p>
                  <a href="mailto:bhavanastudio@gmail.com" className="text-stone-900 text-sm md:text-base hover:text-stone-500 transition-colors break-all">
                    bhavanastudio@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1.5">Phone</p>
                  <a href="tel:+919387103562" className="text-stone-900 text-sm md:text-base hover:text-stone-500 transition-colors">
                    +91 93871 03562
                  </a>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1.5">Studio</p>
                  <p className="text-stone-900 text-sm md:text-base leading-relaxed">
                    Sreedevi Arcade<br />
                    Kairali Junction, Mammyoor<br />
                    Guruvayoor, Kerala, India
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-stone-400 mb-1.5">Availability</p>
                  <p className="text-stone-500 text-sm leading-relaxed">
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
