import Link from "next/link";
import Image from "next/image";

export default function ContactCTA() {
  return (
    <section className="relative py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000"
          alt="Wedding photography"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-stone-950/70" />
      </div>

      <div className="relative container-wide text-center">
        <p className="text-xs tracking-ultra-wide uppercase text-white/50 mb-6">
          Let&apos;s Create Together
        </p>
        <h2 className="text-display text-5xl md:text-7xl text-white mb-8">
          Your Story Deserves
          <br />
          <em className="italic">to Be Told</em>
        </h2>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-12">
          We only take on a limited number of sessions each year to ensure every
          client receives our full attention and artistry.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-stone-900 text-xs tracking-widest uppercase px-10 py-5 hover:bg-stone-100 transition-all"
        >
          Enquire About Availability
        </Link>
      </div>
    </section>
  );
}
