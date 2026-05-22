import Link from "next/link";
import Image from "next/image";

export default function ContactCTA() {
  return (
    <section className="relative py-20 md:py-32 lg:py-48 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/wed-11.jpg"
          alt="Wedding photography"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-stone-950/70" />
      </div>

      <div className="relative container-wide text-center">
        <p className="text-xs tracking-ultra-wide uppercase text-white/50 mb-4 md:mb-6">
          Let&apos;s Create Together
        </p>
        <h2 className="text-display text-4xl md:text-6xl lg:text-7xl text-white mb-6 md:mb-8 leading-tight">
          Your Story Deserves
          <br />
          <em className="italic">to Be Told</em>
        </h2>
        <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-8 md:mb-12 leading-relaxed px-4">
          We only take on a limited number of sessions each year to ensure every
          client receives our full attention and artistry.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-stone-900 text-xs tracking-widest uppercase px-8 py-4 md:px-10 md:py-5 hover:bg-stone-100 transition-all"
        >
          Enquire About Availability
        </Link>
      </div>
    </section>
  );
}
