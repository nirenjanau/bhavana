// import Link from "next/link";

export default function AboutTeaser() {
  return (
    <section className="py-16 md:py-24 lg:py-36">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
            <img
              src="/photoshoot-10.jpg"
              alt="Bhavana photographer"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Text */}
          <div className="lg:pl-8">
            <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-4 md:mb-6">
              About the Studio
            </p>
            <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-6 md:mb-8 leading-tight">
              Photography is{" "}
              <em className="italic text-stone-500">feeling</em>,<br />
              not just framing
            </h2>
            <p className="text-stone-500 leading-relaxed text-sm md:text-base mb-4">
              Bhavana Studio believes every photograph should be a window into
              the soul of the moment — the way the light falls, the unguarded
              laugh, the quiet glance between two people who love each other.
            </p>
            <p className="text-stone-500 leading-relaxed text-sm md:text-base mb-8 md:mb-10">
              With over a decade of editorial and wedding photography experience,
              we approach every session with patience, artistry, and an eye for
              the extraordinary in the ordinary.
            </p>
            {/* <Link
              href="/about"
              className="inline-block text-xs tracking-widest uppercase border-b border-stone-900 pb-1 hover:text-stone-500 hover:border-stone-500 transition-colors"
            >
              Our Story →
            </Link> */}
          </div>
        </div>
      </div>
    </section>
  );
}
