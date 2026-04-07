import Link from "next/link";

const packages = [
  {
    name: "Standard",
    price: "₹60,000",
    description: "Simple and clean coverage for wedding and reception",
    features: ["Pre-wedding shoot", "Wedding + reception coverage", "Classic NT album", "5-min intro video"],
  },
  {
    name: "Classical",
    price: "₹95,000",
    description: "Most popular package with complete candid moments coverage",
    features: ["Pre-wedding shoot", "3-5 min highlights", "Full wedding video", "Classic NT HD album (90 pages)"],
    featured: true,
  },
  {
    name: "Premium",
    price: "₹1,25,000",
    description: "Best cinematic output with premium album quality",
    features: ["Pre-wedding photo + video", "Wedding reel + highlights", "Full-length wedding film", "Premium Pearl album (120 pages)"],
  },
];

export default function PackagesTeaser() {
  return (
    <section className="py-24 md:py-36">
      <div className="container-wide">
        <div className="text-center mb-16">
          <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-3">
            Investment
          </p>
          <h2 className="text-display text-5xl md:text-6xl text-stone-900">
            Packages
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`p-8 md:p-10 border transition-all duration-300 ${
                pkg.featured
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 hover:border-stone-400"
              }`}
            >
              <p
                className={`text-xs tracking-widest uppercase mb-2 ${
                  pkg.featured ? "text-stone-400" : "text-stone-400"
                }`}
              >
                {pkg.name}
              </p>
              <p
                className={`font-serif text-4xl font-light mb-4 ${
                  pkg.featured ? "text-white" : "text-stone-900"
                }`}
              >
                {pkg.price}
              </p>
              <p
                className={`text-sm mb-8 ${
                  pkg.featured ? "text-stone-400" : "text-stone-500"
                }`}
              >
                {pkg.description}
              </p>
              <ul className="space-y-3 mb-10">
                {pkg.features.map((f) => (
                  <li
                    key={f}
                    className={`text-sm flex items-center gap-2 ${
                      pkg.featured ? "text-stone-300" : "text-stone-600"
                    }`}
                  >
                    <span
                      className={`w-4 h-px ${
                        pkg.featured ? "bg-stone-500" : "bg-stone-300"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={`block text-center text-xs tracking-widest uppercase py-3.5 border transition-all ${
                  pkg.featured
                    ? "border-white text-white hover:bg-white hover:text-stone-900"
                    : "border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white"
                }`}
              >
                Book This Package
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/packages"
            className="text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 border-b border-stone-300 hover:border-stone-900 pb-1 transition-all"
          >
            Compare All Packages →
          </Link>
        </div>
      </div>
    </section>
  );
}
