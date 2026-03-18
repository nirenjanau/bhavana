import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Browse Bhavana Studio's collection of wedding, portrait, and family photography.",
};

const categories = ["All", "Wedding", "Couple", "Portrait", "Family", "Events"];

const allPhotos = [
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200", category: "Wedding", title: "Golden Hour Ceremony" },
  { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1200", category: "Portrait", title: "Editorial Portrait" },
  { src: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=1200", category: "Couple", title: "Monsoon Love" },
  { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200", category: "Wedding", title: "Bridal Details" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200", category: "Events", title: "Candid Moments" },
  { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200", category: "Portrait", title: "Studio Light" },
  { src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200", category: "Wedding", title: "Destination Wedding" },
  { src: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1200", category: "Family", title: "New Born Joy" },
  { src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1200", category: "Wedding", title: "Reception Night" },
  { src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1200", category: "Couple", title: "Sunset Silhouette" },
  { src: "https://images.unsplash.com/photo-1612776572997-76cc42e058c3?q=80&w=1200", category: "Family", title: "Family of Three" },
  { src: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=1200", category: "Portrait", title: "Natural Light" },
];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <div className="pt-32 pb-16 bg-stone-50">
        <div className="container-wide">
          <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-4">Our Work</p>
          <h1 className="text-display text-6xl md:text-8xl text-stone-900">Portfolio</h1>
        </div>
      </div>

      {/* Filter (static – would be client component with state) */}
      <div className="sticky top-16 md:top-20 z-30 bg-stone-50/95 backdrop-blur border-b border-stone-200">
        <div className="container-wide">
          <div className="flex gap-6 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                className="text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 whitespace-nowrap transition-colors pb-1 border-b border-transparent hover:border-stone-900"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="container-wide py-12 md:py-16">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {allPhotos.map((photo, i) => (
            <div key={i} className="break-inside-avoid relative group overflow-hidden">
              <Image
                src={photo.src}
                alt={photo.title}
                width={600}
                height={400}
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
