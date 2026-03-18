"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Heart, CheckCircle, Download, Circle } from "lucide-react";
import type { Photo } from "@/types";

interface Props {
  photo: Photo;
  onClose: () => void;
  onLike: () => void;
  onSelect: () => void;
  onDownload: (e: React.MouseEvent) => void;
}

export default function PhotoLightbox({ photo, onClose, onLike, onSelect, onDownload }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/95 flex flex-col"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white/50 text-xs truncate max-w-xs">{photo.filename}</p>
        <div className="flex items-center gap-3">
          {/* Like */}
          <button
            onClick={onLike}
            className={`flex items-center gap-2 px-3 py-2 text-xs rounded transition-all ${
              photo.is_liked
                ? "bg-red-500 text-white"
                : "bg-stone-800 text-white hover:bg-red-500"
            }`}
          >
            <Heart size={13} fill={photo.is_liked ? "currentColor" : "none"} />
            {photo.is_liked ? "Liked" : "Like"}
          </button>

          {/* Select */}
          <button
            onClick={onSelect}
            className={`flex items-center gap-2 px-3 py-2 text-xs rounded transition-all ${
              photo.is_selected
                ? "bg-stone-700 text-white"
                : "bg-stone-800 text-white hover:bg-stone-700"
            }`}
          >
            {photo.is_selected ? <CheckCircle size={13} /> : <Circle size={13} />}
            {photo.is_selected ? "Selected" : "Select"}
          </button>

          {/* Download */}
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(e); }}
            className="flex items-center gap-2 bg-stone-800 text-white px-3 py-2 text-xs rounded hover:bg-stone-700 transition-all"
          >
            <Download size={13} />
            Download
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

      {/* Image */}
      <div
        className="flex-1 relative flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-full max-w-full w-full h-full">
          <Image
            src={photo.preview_url}
            alt={photo.filename}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
