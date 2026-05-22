const testimonials = [
  {
    quote:
      "Bhavana Studio didn't just photograph our wedding — they documented the feeling of the day in a way that still gives us goosebumps every time we look at the album.",
    name: "Priya & Rahul",
    event: "Wedding, Leela Palace Bangalore",
  },
  {
    quote:
      "The pre-wedding shoot was so comfortable and natural. We forgot the camera was even there. The results were beyond anything we imagined.",
    name: "Arjun & Meera",
    event: "Pre-wedding, Coorg",
  },
  {
    quote:
      "Our family portraits look like they belong in a magazine. Truly world-class photography that we will treasure forever.",
    name: "The Krishnamurthy Family",
    event: "Family Portrait Session",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 lg:py-36 bg-stone-900 text-white">
      <div className="container-wide">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs tracking-ultra-wide uppercase text-stone-500 mb-2 md:mb-3">
            Kind Words
          </p>
          <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-white">
            Stories from Clients
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {testimonials.map((t, i) => (
            <div key={i} className="border-t border-stone-700 pt-6 md:pt-8">
              <p className="text-stone-300 text-base md:text-lg font-serif font-light leading-relaxed mb-6 md:mb-8 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-white text-sm font-medium">{t.name}</p>
              <p className="text-stone-500 text-xs tracking-wide mt-1">
                {t.event}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
