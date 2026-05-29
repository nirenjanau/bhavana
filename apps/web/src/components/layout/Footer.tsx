import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-950 text-stone-400">
      <div className="container-wide py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-light text-white tracking-widest uppercase mb-4">
              Bhavana Studio
            </h3>
            <p className="text-sm leading-relaxed text-stone-500">
              Fine art photography for weddings, portraits, and life&apos;s
              milestone moments. Based in Guruvayoor, Kerala — available worldwide.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-stone-500 mb-5">
              Navigate
            </h4>
            <ul className="space-y-3">
              {[
                ["Home", "/"],
                ["Portfolio", "/portfolio"],
                // ["About", "/about"],
                ["Contact", "/contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-stone-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-stone-500 mb-5">
              Get In Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:bhavanastudio@gmail.com"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  bhavanastudio@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  +91 93871 03562
                </a>
              </li>
              <li className="text-stone-500">Guruvayoor, Kerala, India</li>
            </ul>

            <div className="flex gap-4 mt-6">
              {["Instagram"].map((s) => (
                <a
                  key={s}
                  href="https://www.instagram.com/bhavanastudio_guruvayur/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-widest text-stone-500 hover:text-white transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6">
          <p className="text-xs text-stone-600">
            © {year} Bhavana Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
