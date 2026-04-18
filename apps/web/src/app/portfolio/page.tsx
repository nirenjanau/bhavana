import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Browse Bhavana Studio's collection of wedding, portrait, and family photography.",
};

type PortfolioPhoto = {
  src: string;
  category: string;
  title: string;
  width?: number;
  height?: number;
};

const categories = [
  "All",
  "Wedding",
  "Pre-Wedding",
  "Temple Wedding",
  "Photoshoot",
  "Dance",
] as const;

const allPhotos: PortfolioPhoto[] = [
  {
    src: "/wed-1.jpg",
    category: "Wedding",
    title: "Wedding Portrait I",
    width: 768,
    height: 1024,
  },
  {
    src: "/wed-2.jpg",
    category: "Wedding",
    title: "Wedding Portrait II",
    width: 768,
    height: 1024,
  },
  {
    src: "/wed-3.jpg",
    category: "Wedding",
    title: "Wedding Portrait III",
    width: 768,
    height: 1024,
  },
  {
    src: "/wed-4.jpg",
    category: "Wedding",
    title: "Wedding Portrait IV",
    width: 768,
    height: 1024,
  },
  {
    src: "/wed-5.jpg",
    category: "Wedding",
    title: "Wedding Portrait V",
    width: 768,
    height: 1024,
  },
  {
    src: "/wed-6.jpg",
    category: "Wedding",
    title: "Wedding Portrait VI",
    width: 768,
    height: 1024,
  },
  {
    src: "/wed-7.jpg",
    category: "Wedding",
    title: "Wedding Portrait VII",
    width: 768,
    height: 1024,
  },
  {
    src: "/wed-8.jpg",
    category: "Wedding",
    title: "Wedding Portrait VIII",
    width: 768,
    height: 1024,
  },
  {
    src: "/wed-9.jpg",
    category: "Wedding",
    title: "Wedding Portrait IX",
    width: 768,
    height: 1024,
  },
  {
    src: "/wed-10.jpg",
    category: "Wedding",
    title: "Wedding Portrait X",
    width: 768,
    height: 1024,
  },
  {
    src: "/photoshoot-1.jpg",
    category: "Photoshoot",
    title: "Photoshoot Portrait I",
    width: 832,
    height: 1024,
  },
  {
    src: "/photoshoot-3.jpg",
    category: "Photoshoot",
    title: "Photoshoot Portrait III",
    width: 832,
    height: 1024,
  },
  {
    src: "/photoshoot-4.jpg",
    category: "Photoshoot",
    title: "Photoshoot Portrait IV",
    width: 832,
    height: 1024,
  },
  {
    src: "/photoshoot-5.jpg",
    category: "Photoshoot",
    title: "Photoshoot Portrait V",
    width: 832,
    height: 1024,
  },
  {
    src: "/photoshoot-6.jpg",
    category: "Photoshoot",
    title: "Photoshoot Portrait VI",
    width: 832,
    height: 1024,
  },
  {
    src: "/photoshoot-7.jpg",
    category: "Photoshoot",
    title: "Photoshoot Portrait VII",
    width: 832,
    height: 1024,
  },
  {
    src: "/photoshoot-8.jpg",
    category: "Photoshoot",
    title: "Photoshoot Portrait VIII",
    width: 832,
    height: 1024,
  },
  {
    src: "/photoshoot-9.jpg",
    category: "Photoshoot",
    title: "Photoshoot Portrait IX",
    width: 832,
    height: 1024,
  },
  {
    src: "/pre-1.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Portrait I",
    width: 768,
    height: 1024,
  },
  {
    src: "/pre-2.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Portrait II",
    width: 768,
    height: 1024,
  },
  {
    src: "/pre-3.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Portrait III",
    width: 768,
    height: 1024,
  },
  {
    src: "/pre-4.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Portrait IV",
    width: 768,
    height: 1024,
  },
  {
    src: "/pre-5.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Portrait V",
    width: 768,
    height: 1024,
  },
  {
    src: "/pre-6.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Portrait VI",
    width: 768,
    height: 1024,
  },
  {
    src: "/pre-7.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Portrait VI",
    width: 768,
    height: 1024,
  },
  {
    src: "/pre-8.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Portrait VI",
    width: 768,
    height: 1024,
  },
  {
    src: "/pre-9.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Portrait VI",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-1.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding I",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple - 2.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding II",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-3.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding III",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-4.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding IV",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-5.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding V",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-6.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding VI",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-8.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding VII",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-9.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding VIII",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-10.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding IX",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-11.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding X",
    width: 768,
    height: 1024,
  },
  {
    src: "/temple-12.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding XI",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-1.jpg",
    category: "Dance",
    title: "Classical Dance I",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-2.jpg",
    category: "Dance",
    title: "Classical Dance II",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-3.jpg",
    category: "Dance",
    title: "Classical Dance III",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-4.jpg",
    category: "Dance",
    title: "Classical Dance IV",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-5.jpg",
    category: "Dance",
    title: "Classical Dance V",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-6.jpg",
    category: "Dance",
    title: "Classical Dance VI",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-7.jpg",
    category: "Dance",
    title: "Classical Dance VII",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-8.jpg",
    category: "Dance",
    title: "Classical Dance VIII",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-9.jpg",
    category: "Dance",
    title: "Classical Dance IX",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-10.jpg",
    category: "Dance",
    title: "Classical Dance X",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-11.jpg",
    category: "Dance",
    title: "Classical Dance XI",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-12.jpg",
    category: "Dance",
    title: "Classical Dance XII",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-13.jpg",
    category: "Dance",
    title: "Classical Dance XIII",
    width: 768,
    height: 1024,
  },
  {
    src: "/dance-14.jpg",
    category: "Dance",
    title: "Classical Dance XIV",
    width: 768,
    height: 1024,
  },
];

type PortfolioPageProps = {
  searchParams?: {
    category?: string;
  };
};

export default function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const requestedCategory = searchParams?.category;
  const activeCategory =
    requestedCategory && categories.includes(requestedCategory as (typeof categories)[number])
      ? requestedCategory
      : "All";

  // Curated selection for "All" view - mix of best photos from each category
  // Note: Photos shown here won't repeat when filtering by specific category
  const allViewPhotos = [
    allPhotos[0], // Wedding
    allPhotos[18], // Pre-Wedding
    allPhotos[8], // Photoshoot
    allPhotos[7], // Wedding
    allPhotos[40], // Dance VII
    allPhotos[2], // Wedding
    allPhotos[9], // Photoshoot II
    allPhotos[19], // Pre-Wedding
    allPhotos[5], // Wedding
    allPhotos[47], // Dance XIV
  ];

  const filteredPhotos =
    activeCategory === "All"
      ? allViewPhotos
      : allPhotos.filter((photo) => photo.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <div className="pt-32 pb-16 bg-stone-50">
        <div className="container-wide">
          <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-4">Our Work</p>
          <h1 className="text-display text-6xl md:text-8xl text-stone-900">Portfolio</h1>
        </div>
      </div>

      {/* Filter */}
      <div className="sticky top-16 md:top-20 z-30 bg-stone-50/95 backdrop-blur border-b border-stone-200">
        <div className="container-wide">
          <div className="flex gap-6 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === "All" ? "/portfolio" : `/portfolio?category=${encodeURIComponent(cat)}`}
                className={`text-xs tracking-widest uppercase whitespace-nowrap transition-colors pb-1 border-b ${
                  activeCategory === cat
                    ? "text-stone-900 border-stone-900"
                    : "text-stone-500 border-transparent hover:text-stone-900 hover:border-stone-900"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry grid: natural image sizes for dynamic layout */}
      <div className="container-wide py-12 md:py-16">
        <div
          className={
            activeCategory === "Dance"
              ? "columns-1 gap-x-4 sm:columns-2 md:columns-3 xl:columns-4"
              : activeCategory === "Wedding"
              ? "columns-1 gap-x-4 sm:columns-2 md:columns-2 lg:columns-3"
              : "columns-1 gap-x-4 sm:columns-2 lg:columns-3"
          }
        >
          {filteredPhotos.map((photo) => (
            <div
              key={photo.src}
              className="break-inside-avoid mb-4 relative group overflow-hidden rounded-sm bg-stone-200/60 shadow-sm ring-1 ring-stone-200/80"
            >
              <Image
                src={photo.src}
                alt={photo.title}
                width={photo.width ?? 768}
                height={photo.height ?? 1024}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                sizes={
                  activeCategory === "Dance"
                    ? "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    : activeCategory === "Wedding"
                    ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                }
              />
              <div className="pointer-events-none absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/40 transition-all duration-300 flex items-end">
                <div className="p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
                  <p className="text-white font-serif text-xl italic">{photo.title}</p>
                  <p className="text-white/60 text-xs tracking-widest uppercase mt-1">{photo.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
