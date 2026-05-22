const testimonials = [
  {
    quote:
      "Bhavana studio captured the raw emotion in our eyes, the natural moments of pure bliss plus all the magic in between. Their professionalism was outstanding and the passion definitely noticed! The feedback we received for our pre-wedding story/video has been amazing. All because of the team. You guys were an absolute joy to work with! What I particularly loved was the way they managed to keep the shoot casual and natural yet still guide us as to what to do to make the best shots. We didn't feel staged or posed in any way, and the photos we received reflected this. I would definitely recommend them to my friends.",
    name: "Aparna & Adithya",
    event: "Pre-wedding & Photography",
  },
  {
    quote:
      "Very professional yet friendly photographers from Bhavana Studios joined us during the wedding of Lakshmi and Karthik on 8th May. They ensured to gel in with the crowd and captured moments which will be treasured for a lifetime! Will reference Mr Unni and Bhavana Studio for any future work without any doubt. All the best to the talented photographers at Bhavana!",
    name: "Lekshmi Priya.K",
    event: "Wedding — Lakshmi & Karthik, 8 May",
  },
  {
    quote:
      "A really good experience. Unniettan and his team at Bhavana studio will do the work entrusted in atmost responsible and customer friendly way within your budget. The album which they made us was really awesome. Will surely recommend to contact them for your photography/videography requirements.",
    name: "Satheesh N Kaimal",
    event: "Photography & Videography",
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
