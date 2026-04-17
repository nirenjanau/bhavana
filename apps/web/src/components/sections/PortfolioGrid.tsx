import Image from "next/image";
import Link from "next/link";

// One representative photo from each category
const featured = [
  {
    src: "/wedding-red-couple-reflection.jpg",
    alt: "Wedding couple at sunset",
    label: "Wedding",
    category: "Wedding",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/prewedding-bride-saree-kasavu.jpg",
    alt: "Pre-wedding couple portrait",
    label: "Pre-Wedding",
    category: "Pre-Wedding",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/temple-wedding-couple-walk.jpg",
    alt: "Temple wedding in traditional attire",
    label: "Temple Wedding",
    category: "Temple Wedding",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/SnapInsta.to_589022024_18034588811735300_7755584068335030919_n.jpg",
    alt: "Portrait photoshoot",
    label: "Photoshoot",
    category: "Photoshoot",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/SnapInsta.to_615920622_18039592814735300_5175319752092740945_n.jpg",
    alt: "Classical dance performance",
    label: "Dance",
    category: "Dance",
    span: "col-span-1 row-span-1",
  },
];

export default function PortfolioGrid() {
  return (
    <section className="py-24 md:py-36 bg-stone-100">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-3">
              Selected Work
            </p>
            <h2 className="text-display text-5xl md:text-6xl text-stone-900">
              Portfolio
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="mt-6 md:mt-0 text-xs tracking-widest uppercase border-b border-stone-400 pb-1 text-stone-500 hover:text-stone-900 hover:border-stone-900 transition-colors self-start md:self-auto"
          >
            View All Work →
          </Link>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[280px]">
          {featured.map((item, i) => (
            <Link
              key={i}
              href={`/portfolio?category=${encodeURIComponent(item.category)}`}
              className={`relative overflow-hidden group cursor-pointer ${item.span}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/30 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-xs tracking-widest uppercase text-white/80">
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
