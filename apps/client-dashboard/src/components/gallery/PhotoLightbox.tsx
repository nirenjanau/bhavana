"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Heart, CheckCircle, Download, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Photo } from "@/types";

interface Props {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onLike: (id: string) => void;
  onSelect: (id: string) => void;
  onDownload: (photo: Photo) => void;
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
  onLike,
  onSelect,
  onDownload,
}: Props) {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const prev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const next = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/95 flex flex-col"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <p className="text-white/50 text-xs truncate max-w-[160px] sm:max-w-xs">
            {photo.filename}
          </p>
          <span className="text-white/25 text-xs flex-shrink-0">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Like */}
          <button
            onClick={() => onLike(photo.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded transition-all ${
              photo.is_liked
                ? "bg-red-500 text-white"
                : "bg-stone-800 text-white hover:bg-red-500"
            }`}
          >
            <Heart size={13} fill={photo.is_liked ? "currentColor" : "none"} />
            <span className="hidden sm:inline">{photo.is_liked ? "Liked" : "Like"}</span>
          </button>

          {/* Select */}
          <button
            onClick={() => onSelect(photo.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded transition-all ${
              photo.is_selected
                ? "bg-stone-700 text-white"
                : "bg-stone-800 text-white hover:bg-stone-700"
            }`}
          >
            {photo.is_selected ? <CheckCircle size={13} /> : <Circle size={13} />}
            <span className="hidden sm:inline">{photo.is_selected ? "Selected" : "Select"}</span>
          </button>

          {/* Download */}
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(photo); }}
            className="flex items-center gap-1.5 bg-stone-800 text-white px-3 py-2 text-xs rounded hover:bg-stone-700 transition-all"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Image area with prev/next arrows */}
      <div
        className="flex-1 relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev arrow */}
        <button
          onClick={prev}
          disabled={!hasPrev}
          className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 rounded-full bg-stone-900/70 text-white hover:bg-stone-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Image */}
        <div className="relative w-full h-full px-16 py-4">
          <Image
            src={photo.preview_url}
            alt={photo.filename}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Next arrow */}
        <button
          onClick={next}
          disabled={!hasNext}
          className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-stone-900/70 text-white hover:bg-stone-800 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
