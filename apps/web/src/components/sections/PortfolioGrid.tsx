import Image from "next/image";
import Link from "next/link";

// One representative photo per category (includes newly added assets where relevant)
const featured = [
  {
    src: "/wed-1.jpg",
    alt: "Wedding photography",
    label: "Wedding",
    category: "Wedding",
    width: 768,
    height: 1024,
  },
  {
    src: "/pre-1.jpg",
    alt: "Pre-wedding couple portrait",
    label: "Pre-Wedding",
    category: "Pre-Wedding",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-3.jpg",
    alt: "Temple wedding in traditional attire",
    label: "Temple Wedding",
    category: "Temple Wedding",
    width: 768,
    height: 1024,
  },
  {
    src: "/photoshoot-10.jpg",
    alt: "Portrait photoshoot",
    label: "Photoshoot",
    category: "Photoshoot",
    width: 832,
    height: 1024,
  },
  {
    src: "/dance-13.jpg",
    alt: "Classical dance performance",
    label: "Dance",
    category: "Dance",
    width: 768,
    height: 1024,
  },
{
    src: "/wed-6.jpg",
    alt: "Wedding photography",
    label: "Wedding",
    category: "Wedding",
    width: 768,
    height: 1024,
  },
];

export default function PortfolioGrid() {
  return (
    <section className="py-16 md:py-24 lg:py-36 bg-stone-100">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-2 md:mb-3">
              Selected Work
            </p>
            <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-stone-900">
              Portfolio
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="mt-4 md:mt-0 text-xs tracking-widest uppercase border-b border-stone-400 pb-1 text-stone-500 hover:text-stone-900 hover:border-stone-900 transition-colors self-start md:self-auto"
          >
            View All Work →
          </Link>
        </div>

        {/* Responsive grid - images at their natural sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {featured.map((item, i) => (
            <Link
              key={item.src}
              href={`/portfolio?category=${encodeURIComponent(item.category)}`}
              className="relative overflow-hidden rounded-sm group cursor-pointer bg-stone-200/60 shadow-sm ring-1 ring-stone-200/80"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/30 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-xs md:text-sm tracking-widest uppercase text-white font-medium">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
