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
    src: "/wedding-red-couple-reflection.jpg",
    category: "Wedding",
    title: "Wedding Couple Sunset",
    width: 769,
    height: 1024,
  },
  {
    src: "/wedding-red-couple-garden.jpg",
    category: "Wedding",
    title: "Wedding Garden Candid",
    width: 768,
    height: 1024,
  },
  {
    src: "/wedding-red-bride-reflection.jpg",
    category: "Wedding",
    title: "Wedding Bride Reflection",
    width: 768,
    height: 1024,
  },
  {
    src: "/wedding-beach-couple-sunset.jpg",
    category: "Wedding",
    title: "Wedding Beach Sunset Couple",
    width: 768,
    height: 1024,
  },
  {
    src: "/wedding-beach-closeup-smile.jpg",
    category: "Wedding",
    title: "Wedding Beach Close-up",
    width: 768,
    height: 1024,
  },
  {
    src: "/wedding-beach-arch-window.jpg",
    category: "Wedding",
    title: "Wedding Beach Arch Portrait",
    width: 768,
    height: 1024,
  },
  {
    src: "/SnapInsta.to_589963019_18034588787735300_8002153575810695012_n.jpg",
    category: "Photoshoot",
    title: "Bhavana Photographer",
    width: 863,
    height: 1071,
  },
  {
    src: "/SnapInsta.to_589022024_18034588811735300_7755584068335030919_n.jpg",
    category: "Photoshoot",
    title: "Portrait Photoshoot",
    width: 782,
    height: 1024,
  },
  {
    src: "/photoshoot-pink-saree-portrait-1.jpg",
    category: "Photoshoot",
    title: "Photoshoot Pink Saree Portrait I",
    width: 832,
    height: 1024,
  },
  {
    src: "/photoshoot-pink-saree-portrait-2.jpg",
    category: "Photoshoot",
    title: "Photoshoot Pink Saree Portrait II",
    width: 832,
    height: 1024,
  },
  {
    src: "/prewedding-bride-saree-kasavu.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Couple Portrait",
    width: 765,
    height: 1024,
  },
  {
    src: "/prewedding-doorway-couple.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Doorway Portrait",
    width: 768,
    height: 1024,
  },
  {
    src: "/prewedding-orange-portrait.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Orange Saree Portrait",
    width: 1024,
    height: 1024,
  },
  {
    src: "/prewedding-smile-closeup.jpg",
    category: "Pre-Wedding",
    title: "Pre-Wedding Close-up Smile",
    width: 1024,
    height: 1024,
  },
  {
    src: "/temple-wedding-couple-walk.jpg",
    category: "Temple Wedding",
    title: "Temple Kasavu Wedding",
    width: 768,
    height: 1024,
  },
  {
    src: "/SnapInsta.to_657748489_18095835962046191_4582995963299546328_n.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding Portrait",
  },
  {
    src: "/SnapInsta.to_656314899_18107749237830196_699475007509695201_n (1).jpg",
    category: "Temple Wedding",
    title: "Temple Wedding Couple Walk",
  },
  {
    src: "/SnapInsta.to_655192689_18110226304832135_6709450498053993694_n.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding Ritual Crowd",
  },
  {
    src: "/SnapInsta.to_653466367_18109749901793576_1312211937127569578_n.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding Blessing",
  },
  {
    src: "/SnapInsta.to_653108934_18082162952346305_104236921595586094_n.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding Lamp Ceremony",
  },
  {
    src: "/SnapInsta.to_642509517_18044443079735300_8970737621993001547_n.jpg",
    category: "Temple Wedding",
    title: "Temple Wedding Sacred Ritual",
  },
  {
    src: "/SnapInsta.to_615920622_18039592814735300_5175319752092740945_n.jpg",
    category: "Dance",
    title: "Classical Dance",
    width: 634,
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
  const allViewPhotos = [
    allPhotos[0],  // Wedding
    allPhotos[9],  // Pre-Wedding
    allPhotos[12], // Temple Wedding
    allPhotos[6],  // Photoshoot
    allPhotos[19], // Dance
    allPhotos[2],  // Wedding
    allPhotos[14], // Temple Wedding
    allPhotos[10], // Pre-Wedding
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

      {/* Masonry Grid */}
      <div className="container-wide py-12 md:py-16">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filteredPhotos.map((photo, i) => (
            <div key={i} className="break-inside-avoid relative group overflow-hidden">
              <Image
                src={photo.src}
                alt={photo.title}
                width={photo.width ?? 600}
                height={photo.height ?? 400}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/40 transition-all duration-300 flex items-end">
                <div className="p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
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
