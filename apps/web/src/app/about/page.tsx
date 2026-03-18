import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Bhavana Studio — fine art photography with soul.",
};

const values = [
  { title: "Authenticity", desc: "We chase unscripted moments, the ones that can't be rehearsed." },
  { title: "Artistry", desc: "Every image is crafted with intention — light, composition, and emotion." },
  { title: "Intimacy", desc: "We take on limited bookings so every client gets our full presence." },
  { title: "Legacy", desc: "We create heirlooms, not just files. Images built to outlast generations." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2000"
          alt="Bhavana photographer at work"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container-wide pb-16">
          <p className="text-xs tracking-ultra-wide uppercase text-white/50 mb-4">Our Story</p>
          <h1 className="text-display text-6xl md:text-8xl text-white">About</h1>
        </div>
      </div>

      {/* Story */}
      <section className="py-24 md:py-36">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-display text-4xl md:text-5xl text-stone-900 mb-8">
                We believe photographs are the truest form of memory
              </h2>
              <p className="text-stone-500 leading-relaxed mb-6">
                Bhavana Studio was founded in 2013 in the heart of Bangalore by lead photographer
                Bhavana Krishnan, who began her career shooting editorial fashion for print publications
                before falling in love with the rawness and emotion of wedding and portrait photography.
              </p>
              <p className="text-stone-500 leading-relaxed mb-6">
                Over the past decade, we&apos;ve had the privilege of documenting over 400 weddings,
                intimate elopements, family milestones, and portraiture sessions across India, Sri Lanka,
                and Southeast Asia.
              </p>
              <p className="text-stone-500 leading-relaxed">
                Our style is best described as editorial with heart — clean compositions, natural light
                whenever possible, and a deep respect for the emotion unfolding in front of the lens.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800"
                  alt="Bhavana Krishnan, photographer"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <p className="text-stone-400 text-sm text-center italic">
                Bhavana Krishnan, Founder & Lead Photographer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-36 bg-stone-100">
        <div className="container-wide">
          <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-3">What We Stand For</p>
          <h2 className="text-display text-5xl md:text-6xl text-stone-900 mb-16">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={v.title}>
                <p className="font-serif text-6xl font-light text-stone-200 mb-4">0{i + 1}</p>
                <h3 className="font-medium text-stone-900 tracking-wider uppercase text-sm mb-3">
                  {v.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 md:py-36">
        <div className="container-wide">
          <h2 className="text-display text-5xl md:text-6xl text-stone-900 mb-16">The Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Bhavana Krishnan", role: "Founder & Lead Photographer", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600" },
              { name: "Rohan Mehta", role: "Second Photographer", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600" },
              { name: "Ananya Iyer", role: "Videographer & Editor", img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600" },
            ].map((member) => (
              <div key={member.name}>
                <div className="relative aspect-[3/4] overflow-hidden mb-5 grayscale hover:grayscale-0 transition-all duration-700">
                  <Image
                    src={member.img}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <h3 className="font-medium text-stone-900">{member.name}</h3>
                <p className="text-stone-500 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-stone-900 text-center">
        <div className="container-wide">
          <h2 className="text-display text-5xl text-white mb-6">
            Ready to Work Together?
          </h2>
          <Link
            href="/contact"
            className="inline-block border border-white text-white text-xs tracking-widest uppercase px-10 py-4 hover:bg-white hover:text-stone-900 transition-all"
          >
            Get In Touch
          </Link>
        </div>
      </section>
    </>
  );
}
