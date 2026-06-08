"use client";

import Image from "next/image";
import { Heart, CheckCircle, Download, ZoomIn, Circle, ImageOff } from "lucide-react";
import { useState } from "react";
import type { Photo } from "@/types";

interface Props {
  photo: Photo;
  onLike: (id: string) => Promise<void>;
  onSelect: (id: string) => Promise<void>;
  onZoom: () => void;
  onDownload: (photo: Photo) => void;
}

export default function PhotoCard({ photo, onLike, onSelect, onZoom, onDownload }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative bg-stone-100 overflow-hidden aspect-square">
      {/* Thumbnail */}
      {imgError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-400">
          <ImageOff size={24} />
          <span className="text-xs text-center px-2 truncate max-w-full">{photo.filename}</span>
        </div>
      ) : (
        <Image
          src={photo.thumbnail_url}
          alt={photo.filename}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/40 transition-all duration-300" />

      {/* Status badges */}
      <div className="absolute top-2 left-2 flex gap-1.5">
        {photo.is_liked && (
          <span className="flex items-center gap-1 bg-stone-950/80 text-white text-xs px-1.5 py-1 rounded">
            <Heart size={10} fill="currentColor" />
          </span>
        )}
        {photo.is_selected && (
          <span className="flex items-center gap-1 bg-stone-950/80 text-white text-xs px-1.5 py-1 rounded">
            <CheckCircle size={10} />
          </span>
        )}
      </div>

      {/* Action buttons — shown on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex gap-1.5">
          {/* Like */}
          <button
            onClick={(e) => { e.stopPropagation(); onLike(photo.id); }}
            className={`p-2 rounded transition-all ${
              photo.is_liked
                ? "bg-red-500 text-white"
                : "bg-stone-950/70 text-white hover:bg-red-500"
            }`}
            title={photo.is_liked ? "Unlike" : "Like"}
          >
            <Heart size={13} fill={photo.is_liked ? "currentColor" : "none"} />
          </button>

          {/* Select */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(photo.id); }}
            className={`p-2 rounded transition-all ${
              photo.is_selected
                ? "bg-stone-900 text-white"
                : "bg-stone-950/70 text-white hover:bg-stone-900"
            }`}
            title={photo.is_selected ? "Deselect" : "Select for album"}
          >
            {photo.is_selected ? <CheckCircle size={13} /> : <Circle size={13} />}
          </button>
        </div>

        <div className="flex gap-1.5">
          {/* Zoom */}
          <button
            onClick={(e) => { e.stopPropagation(); onZoom(); }}
            className="p-2 bg-stone-950/70 text-white rounded hover:bg-stone-900 transition-all"
            title="View full size"
          >
            <ZoomIn size={13} />
          </button>

          {/* Download */}
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(photo); }}
            className="p-2 bg-stone-950/70 text-white rounded hover:bg-stone-900 transition-all"
            title="Download"
          >
            <Download size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
