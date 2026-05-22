"use client";

import { useState } from "react";

type HighlightVideo = {
  youtubeId: string;
  title: string;
  subtitle: string;
  description?: string;
  location?: string;
};

const CHANNEL_URL = "https://www.youtube.com/channel/UCv29Ammt4taJ-EpjLBU8dwg";

const featuredFilm: HighlightVideo = {
  youtubeId: "6vCCprDgXvg",
  title: "Roshni & Sabarinath",
  subtitle: "Wedding Highlight · Guruvayoor",
  description:
    "A beautiful celebration of love and tradition, set against the sacred backdrop of Guruvayoor. Every frame is a quiet poem of two families becoming one.",
  location: "Guruvayoor",
};

const highlightFilms: HighlightVideo[] = [
  {
    youtubeId: "R7NKwAO9RJw",
    title: "Arun & Aparna",
    subtitle: "Wedding Highlight",
    location: "Kerala",
  },
  {
    youtubeId: "oeU_LcjbEWA",
    title: "Nivya & Jithin",
    subtitle: "Guruvayoor Wedding",
    location: "Guruvayoor",
  },
  {
    youtubeId: "gPw8iPpc5zU",
    title: "Nivedita & Athul",
    subtitle: "Guruvayoor Wedding",
    location: "Guruvayoor",
  },
  {
    youtubeId: "rFhG94_ISa0",
    title: "Athira & Aditya",
    subtitle: "Wedding Highlight",
    location: "Kerala",
  },
  {
    youtubeId: "jtdPQ3E9BuM",
    title: "Arathi & Arun",
    subtitle: "Wedding Highlight",
    location: "Kerala",
  },
  {
    youtubeId: "zpKYd1StlOw",
    title: "Rashmi & Deepu",
    subtitle: "Wedding Moments",
    location: "Kerala",
  },
  {
    youtubeId: "syP9FWb7by8",
    title: "Shruthi & Piyush",
    subtitle: "Wedding Moments",
    location: "Kerala",
  },
  {
    youtubeId: "35mBkKSQeEE",
    title: "Drishya & Anoop",
    subtitle: "Guruvayoor Wedding",
    location: "Guruvayoor",
  },
  {
    youtubeId: "I9CT1T3_SsA",
    title: "Nirmalya & Gilberto",
    subtitle: "Guruvayoor Wedding",
    location: "Guruvayoor",
  },
];

function PlayButton({ size = "lg" }: { size?: "lg" | "sm" }) {
  const dim = size === "lg" ? "w-20 h-20" : "w-14 h-14";
  const icon = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div
      className={`${dim} rounded-full bg-white/10 border border-white/40 backdrop-blur-sm flex items-center justify-center transition-all duration-500 group-hover:bg-white/20 group-hover:scale-110`}
    >
      <svg
        className={`${icon} text-white translate-x-0.5`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

function VideoThumbnail({
  youtubeId,
  title,
  size = "lg",
  onPlay,
}: {
  youtubeId: string;
  title: string;
  size?: "lg" | "sm";
  onPlay: () => void;
}) {
  return (
    <div
      className="relative w-full aspect-video overflow-hidden rounded-sm bg-stone-200/60 shadow-sm ring-1 ring-stone-200/80 cursor-pointer group"
      onClick={onPlay}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors duration-300" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <PlayButton size={size} />
      </div>
      <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white/70 text-xs tracking-widest uppercase">
          Click to watch
        </p>
      </div>
    </div>
  );
}

function VideoEmbed({ youtubeId }: { youtubeId: string }) {
  return (
    <div className="relative w-full aspect-video rounded-sm overflow-hidden shadow-sm ring-1 ring-stone-200/80">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&color=white`}
        title="Wedding highlight film"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}

function FeaturedFilm({ film }: { film: HighlightVideo }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
      <div className="lg:col-span-7">
        {playing ? (
          <VideoEmbed youtubeId={film.youtubeId} />
        ) : (
          <VideoThumbnail
            youtubeId={film.youtubeId}
            title={film.title}
            size="lg"
            onPlay={() => setPlaying(true)}
          />
        )}
      </div>
      <div className="lg:col-span-5 flex flex-col justify-center">
        <span className="text-display text-stone-300 text-7xl leading-none select-none mb-4 block">
          01
        </span>
        <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-3">
          Featured Film
        </p>
        <h3 className="text-display text-4xl md:text-5xl text-stone-900 leading-tight mb-4">
          {film.title}
        </h3>
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-6">
          {film.subtitle}
        </p>
        {film.description && (
          <p className="text-stone-500 leading-relaxed text-sm mb-8 max-w-sm">
            {film.description}
          </p>
        )}
        <div className="flex gap-6 border-t border-stone-200 pt-6">
          {film.location && (
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">
                Location
              </p>
              <p className="text-sm text-stone-700">{film.location}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilmCard({
  film,
  index,
}: {
  film: HighlightVideo;
  index: number;
}) {
  const [playing, setPlaying] = useState(false);
  const num = String(index + 2).padStart(2, "0");

  return (
    <div className="flex flex-col">
      {playing ? (
        <VideoEmbed youtubeId={film.youtubeId} />
      ) : (
        <VideoThumbnail
          youtubeId={film.youtubeId}
          title={film.title}
          size="sm"
          onPlay={() => setPlaying(true)}
        />
      )}
      <div className="mt-4 flex items-start gap-4">
        <span className="text-display text-stone-300 text-2xl leading-none select-none shrink-0 mt-1">
          {num}
        </span>
        <div>
          <h4 className="font-serif text-xl font-light text-stone-900 italic">
            {film.title}
          </h4>
          <p className="text-xs tracking-widest uppercase text-stone-400 mt-1">
            {film.subtitle}
          </p>
          {film.location && (
            <p className="text-xs text-stone-400 mt-1">{film.location}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WeddingHighlights() {
  return (
    <section className="py-24 md:py-36 bg-stone-100">
      <div className="container-wide">

        {/* Section header */}
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs tracking-ultra-wide uppercase text-stone-400 mb-4">
              Film
            </p>
            <h2 className="text-display text-5xl md:text-6xl text-stone-900">
              Wedding Highlights
            </h2>
          </div>
          <p className="text-stone-500 leading-relaxed max-w-xs text-sm">
            Every love story deserves to be felt, not just seen. Watch our
            cinematic wedding films — all filmed on location across Kerala.
          </p>
        </div>

        {/* Featured film */}
        <FeaturedFilm film={featuredFilm} />

        {/* Divider */}
        <div className="border-t border-stone-200 my-16 md:my-20" />

        {/* More films */}
        <div className="flex items-end justify-between mb-10">
          <p className="text-xs tracking-ultra-wide uppercase text-stone-400">
            More Films
          </p>
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest uppercase text-stone-500 border-b border-stone-300 pb-0.5 hover:text-stone-900 hover:border-stone-900 transition-colors duration-300"
          >
            View All on YouTube →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {highlightFilms.map((film, i) => (
            <FilmCard key={film.youtubeId} film={film} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
