import Image from "next/image";
import Link from "next/link";

const featured = [
  {
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200",
    alt: "Beach wedding ceremony",
    label: "Wedding",
    span: "col-span-1 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=1200",
    alt: "Monsoon pre-wedding",
    label: "Couple",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200",
    alt: "Minimalist portrait",
    label: "Portrait",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200",
    alt: "Bridal details",
    label: "Wedding",
    span: "col-span-1 row-span-1",
  },
  {
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200",
    alt: "Candid family moment",
    label: "Family",
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
            <div
              key={i}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
