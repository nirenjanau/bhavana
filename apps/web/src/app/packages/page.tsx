import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Packages & Pricing",
  description: "Photography packages for weddings, portraits, and events. Transparent pricing from Bhavana Studio.",
};

const packages = [
  {
    tier: "01",
    name: "Essentials",
    price: "₹45,000",
    tagline: "Perfect for intimate ceremonies and portraits",
    features: [
      "4 hours of photography coverage",
      "1 professional photographer",
      "200+ fully edited images",
      "Private online gallery access",
      "High-resolution digital downloads",
      "14-day delivery",
    ],
    addOns: ["Extra hour: ₹8,000", "Second shooter: ₹15,000"],
    featured: false,
  },
  {
    tier: "02",
    name: "Signature",
    price: "₹95,000",
    tagline: "Our most popular full-day experience",
    features: [
      "8 hours of photography coverage",
      "2 professional photographers",
      "500+ fully edited images",
      "Private online gallery access",
      "High-resolution digital downloads",
      "Premium 40-page flush-mount album",
      "Engagement / pre-wedding session included",
      "7-day priority delivery",
    ],
    addOns: ["Videography: ₹60,000", "Same-day highlights: ₹20,000"],
    featured: true,
  },
  {
    tier: "03",
    name: "Luxury",
    price: "₹1,75,000",
    tagline: "An immersive, multi-day cinematic experience",
    features: [
      "2–3 days of full coverage",
      "2 photographers + videographer",
      "800+ fully edited images",
      "Private online gallery access",
      "4K cinematic wedding film (5–7 min)",
      "Premium heirloom album (60 pages)",
      "Same-day highlight reel",
      "Destination travel included within India",
      "Priority 5-day delivery",
    ],
    addOns: ["International travel: quote available", "Fine art prints: from ₹5,000"],
    featured: false,
  },
];

const addOns = [
  { name: "Photo Booth", price: "₹20,000", desc: "3 hours with unlimited prints" },
  { name: "Drone Aerial", price: "₹15,000", desc: "FAA-licensed drone coverage" },
  { name: "Heirloom Prints", price: "From ₹5,000", desc: "Gallery-quality fine art prints" },
  { name: "Rush Delivery", price: "₹10,000", desc: "48-hour turnaround" },
];

export default function PackagesPage() {
  return (
    <>
      {/* Hero */}
      <div className="pt-32 pb-16 bg-stone-50">
        <div className="container-wide">
          <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-4">Investment</p>
          <h1 className="text-display text-6xl md:text-8xl text-stone-900 mb-6">Packages</h1>
          <p className="text-stone-500 max-w-xl text-lg">
            Every package includes our full creative direction, post-processing artistry, and
            a private client gallery portal.
          </p>
        </div>
      </div>

      {/* Packages */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`flex flex-col border p-8 md:p-10 ${
                  pkg.featured
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white"
                }`}
              >
                <div className="mb-8">
                  <p className={`text-xs tracking-widest uppercase mb-1 ${pkg.featured ? "text-stone-500" : "text-stone-400"}`}>
                    Package {pkg.tier}
                  </p>
                  <h2 className={`font-serif text-3xl font-light mb-2 ${pkg.featured ? "text-white" : "text-stone-900"}`}>
                    {pkg.name}
                  </h2>
                  <p className={`font-serif text-5xl font-light mb-3 ${pkg.featured ? "text-white" : "text-stone-900"}`}>
                    {pkg.price}
                  </p>
                  <p className={`text-sm ${pkg.featured ? "text-stone-400" : "text-stone-500"}`}>
                    {pkg.tagline}
                  </p>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className={`flex items-start gap-3 text-sm ${pkg.featured ? "text-stone-300" : "text-stone-600"}`}>
                      <span className={`mt-2 w-3 h-px flex-shrink-0 ${pkg.featured ? "bg-stone-600" : "bg-stone-300"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {pkg.addOns.length > 0 && (
                  <div className={`mb-8 text-xs ${pkg.featured ? "text-stone-500" : "text-stone-400"}`}>
                    <p className="uppercase tracking-widest mb-2">Popular Add-ons</p>
                    {pkg.addOns.map((a) => <p key={a}>+ {a}</p>)}
                  </div>
                )}

                <Link
                  href="/contact"
                  className={`block text-center text-xs tracking-widest uppercase py-4 border transition-all ${
                    pkg.featured
                      ? "border-white text-white hover:bg-white hover:text-stone-900"
                      : "border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white"
                  }`}
                >
                  Book {pkg.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-wide">
          <h2 className="text-display text-4xl md:text-5xl text-stone-900 mb-12">
            À La Carte Add-ons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((a) => (
              <div key={a.name} className="border border-stone-200 p-6">
                <p className="font-serif text-xl font-light text-stone-900 mb-1">{a.name}</p>
                <p className="text-stone-400 text-xs tracking-widest uppercase mb-3">{a.price}</p>
                <p className="text-stone-500 text-sm">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="container-wide max-w-3xl">
          <h2 className="text-display text-4xl md:text-5xl text-stone-900 mb-12">
            Frequently Asked
          </h2>
          {[
            ["How far in advance should I book?", "We recommend booking 6–12 months in advance for weddings. Portrait sessions can often be scheduled 2–4 weeks out."],
            ["Do you travel for destination events?", "Absolutely. Travel within India is included in the Luxury package. For international destinations, we provide a custom quote covering flights and accommodation."],
            ["How do I receive my photos?", "All images are delivered via your private Bhavana Studio client portal, where you can like, select, and download your photos at any time."],
            ["What payment terms do you offer?", "We require a 30% booking retainer to secure your date, with the balance due 2 weeks before your session."],
          ].map(([q, a]) => (
            <div key={q as string} className="border-b border-stone-200 py-6">
              <p className="font-medium text-stone-900 mb-3">{q}</p>
              <p className="text-stone-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
