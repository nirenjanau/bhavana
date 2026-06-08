"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { ChevronRight, Folder as FolderIcon, Home } from "lucide-react";
import type { TreeResponse, Photo } from "@/types";
import PhotoCard from "./PhotoCard";
import PhotoLightbox from "./PhotoLightbox";
import { toggleLike, toggleSelect, getDownloadUrl } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function fetcher([url, token]: [string, string]) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => {
    if (!r.ok) throw new Error("Request failed");
    return r.json();
  });
}

interface Props {
  token: string;
  folderId: string | null;
  onNavigate: (folderId: string | null) => void;
  onStatsChange?: () => void;
}

export default function FolderBrowser({ token, folderId, onNavigate, onStatsChange }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const key = folderId
    ? `${API_URL}/api/gallery/tree?parent_id=${folderId}&limit=120`
    : `${API_URL}/api/gallery/tree?limit=120`;

  const { data, mutate } = useSWR<TreeResponse>(
    [key, token],
    fetcher,
    { keepPreviousData: true }
  );

  const handleLike = useCallback(
    async (photoId: string) => {
      try {
        const r = await toggleLike(photoId, token);
        mutate(
          (prev) =>
            prev
              ? {
                  ...prev,
                  photos: prev.photos.map((p) =>
                    p.id === photoId ? { ...p, is_liked: r.is_liked } : p
                  ),
                }
              : prev,
          false
        );
        toast(r.is_liked ? "❤️ Liked" : "Unliked");
        onStatsChange?.();
      } catch {
        toast.error("Failed to update");
      }
    },
    [token, mutate, onStatsChange]
  );

  const handleSelect = useCallback(
    async (photoId: string) => {
      try {
        const r = await toggleSelect(photoId, token);
        mutate(
          (prev) =>
            prev
              ? {
                  ...prev,
                  photos: prev.photos.map((p) =>
                    p.id === photoId ? { ...p, is_selected: r.is_selected } : p
                  ),
                }
              : prev,
          false
        );
        toast(r.is_selected ? "✓ Selected for album" : "Deselected");
        onStatsChange?.();
      } catch {
        toast.error("Failed to update");
      }
    },
    [token, mutate, onStatsChange]
  );

  const handleDownload = useCallback(async (photo: Photo) => {
    try {
      const { url, filename } = await getDownloadUrl(photo.id, token);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Download started");
    } catch {
      toast.error("Download failed");
    }
  }, [token]);

  const breadcrumb = data?.breadcrumb ?? [];
  const folders = data?.folders ?? [];
  const photos = data?.photos ?? [];

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => onNavigate(null)}
          className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-100 whitespace-nowrap ${
            folderId ? "text-stone-500" : "text-stone-900 font-medium"
          }`}
        >
          <Home size={14} />
          My Gallery
        </button>
        {breadcrumb.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5 whitespace-nowrap">
            <ChevronRight size={14} className="text-stone-300" />
            <button
              onClick={() => onNavigate(c.id)}
              className={`px-2 py-1 rounded hover:bg-stone-100 ${
                c.id === folderId ? "text-stone-900 font-medium" : "text-stone-500"
              }`}
            >
              {c.title}
            </button>
          </span>
        ))}
      </nav>

      {/* Folders */}
      {!data ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-stone-100 animate-pulse rounded" />
          ))}
        </div>
      ) : folders.length > 0 ? (
        <section className="mb-10">
          <h3 className="text-xs tracking-widest uppercase text-stone-400 mb-3">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => onNavigate(f.id)}
                className="text-left bg-white border border-stone-200 hover:border-stone-900 transition-colors p-4"
              >
                <FolderIcon size={28} className="text-stone-500 mb-3" />
                <p className="text-stone-900 font-medium text-sm truncate">{f.title}</p>
                <p className="text-stone-400 text-xs mt-0.5">
                  {f.folder_count} subfolder{f.folder_count === 1 ? "" : "s"} · {f.photo_count} photo{f.photo_count === 1 ? "" : "s"}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Photos in current folder */}
      {photos.length > 0 ? (
        <section>
          {folders.length > 0 && (
            <h3 className="text-xs tracking-widest uppercase text-stone-400 mb-3">Photos</h3>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {photos.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onLike={handleLike}
                onSelect={handleSelect}
                onZoom={() => setLightboxIndex(i)}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </section>
      ) : (
        folders.length === 0 && data && (
          <div className="border border-dashed border-stone-200 bg-white p-12 text-center">
            <FolderIcon size={32} className="mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 text-sm">
              {folderId
                ? "This folder is empty — your photographer hasn't added anything here yet."
                : "No folders yet. Your photographer will organise your photos into folders soon."}
            </p>
            {folderId && (
              <button
                onClick={() => onNavigate(null)}
                className="mt-4 text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900"
              >
                ← Back to My Gallery
              </button>
            )}
          </div>
        )
      )}

      {lightboxIndex !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onLike={handleLike}
          onSelect={handleSelect}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
