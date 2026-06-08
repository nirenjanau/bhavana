"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { signOut } from "next-auth/react";
import { Download, Heart, CheckSquare, LogOut, Grid2X2, Grid3X3, FolderTree } from "lucide-react";
import toast from "react-hot-toast";
import type { Filter, GalleryResponse, GalleryStats, Photo } from "@/types";
import PhotoCard from "./PhotoCard";
import PhotoLightbox from "./PhotoLightbox";
import FolderBrowser from "./FolderBrowser";
import BackToHomeLink from "@/components/BackToHomeLink";
import { toggleLike, toggleSelect, bulkDownload, getDownloadUrl } from "@/lib/api";

type View = "folders" | Filter;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const LIMIT = 24;

function fetcher(url: string, token: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(
    (r) => r.json()
  );
}

interface Props {
  userName: string;
  token: string;
}

export default function GalleryClient({ userName, token }: Props) {
  const [view, setView] = useState<View>("folders");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState<3 | 4>(4);
  const [downloading, setDownloading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filter: Filter = view === "folders" ? "all" : view;
  const flatMode = view !== "folders";

  const galleryKey = `${API_URL}/api/gallery?filter=${filter}&page=${page}&limit=${LIMIT}`;
  const statsKey = `${API_URL}/api/gallery/stats`;

  const { data: gallery, mutate: mutateGallery } = useSWR<GalleryResponse>(
    flatMode ? galleryKey : null,
    (url: string) => fetcher(url, token),
    { keepPreviousData: true }
  );

  const { data: stats, mutate: mutateStats } = useSWR<GalleryStats>(
    statsKey,
    (url: string) => fetcher(url, token)
  );

  const handleLike = useCallback(
    async (photoId: string) => {
      try {
        const result = await toggleLike(photoId, token);
        await mutateGallery(
          (prev) =>
            prev
              ? {
                  ...prev,
                  photos: prev.photos.map((p) =>
                    p.id === photoId ? { ...p, is_liked: result.is_liked } : p
                  ),
                }
              : prev,
          false
        );
        await mutateStats();
        toast(result.is_liked ? "❤️ Liked" : "Unliked");
      } catch {
        toast.error("Failed to update");
      }
    },
    [token, mutateGallery, mutateStats]
  );

  const handleSelect = useCallback(
    async (photoId: string) => {
      try {
        const result = await toggleSelect(photoId, token);
        await mutateGallery(
          (prev) =>
            prev
              ? {
                  ...prev,
                  photos: prev.photos.map((p) =>
                    p.id === photoId
                      ? { ...p, is_selected: result.is_selected }
                      : p
                  ),
                }
              : prev,
          false
        );
        await mutateStats();
        toast(result.is_selected ? "✓ Selected for album" : "Deselected");
      } catch {
        toast.error("Failed to update");
      }
    },
    [token, mutateGallery, mutateStats]
  );

  const handleBulkDownload = useCallback(async () => {
    setDownloading(true);
    const toastId = toast.loading("Preparing your download...");
    try {
      const blob = await bulkDownload(token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bhavana-gallery.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Download started!", { id: toastId });
    } catch {
      toast.error("Download failed", { id: toastId });
    } finally {
      setDownloading(false);
    }
  }, [token]);

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

  const tabs: { value: View; label: string; count?: number; icon?: React.ReactNode }[] = [
    { value: "folders", label: "Folders", icon: <FolderTree size={13} /> },
    { value: "all", label: "All Photos", count: stats?.total },
    { value: "liked", label: "Liked", count: stats?.liked },
    { value: "selected", label: "Selected", count: stats?.selected },
  ];

  const photos = gallery?.photos ?? [];
  const pagination = gallery?.pagination;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackToHomeLink className="hidden sm:inline-flex" />
            <span className="hidden sm:block text-stone-300">|</span>
            <h1 className="font-serif text-xl font-light text-stone-900 tracking-widest uppercase">
              Bhavana Studio
            </h1>
            <span className="hidden sm:block text-stone-300">|</span>
            <span className="hidden sm:block text-stone-500 text-sm">
              Welcome, {userName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {stats && stats.selected > 0 && (
              <button
                onClick={handleBulkDownload}
                disabled={downloading}
                className="flex items-center gap-2 text-xs tracking-widest uppercase bg-stone-900 text-white px-4 py-2.5 hover:bg-stone-700 transition-colors disabled:opacity-60"
              >
                <Download size={13} />
                <span className="hidden sm:inline">
                  Download {stats.selected} Selected
                </span>
                <span className="sm:hidden">Download</span>
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="sm:hidden px-4 pt-3">
        <BackToHomeLink />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        {stats && (
          <div className="flex items-center gap-8 mb-8 text-sm">
            <div className="flex items-center gap-2 text-stone-500">
              <Grid3X3 size={14} />
              <span>{stats.total} photos</span>
            </div>
            <div className="flex items-center gap-2 text-stone-500">
              <Heart size={14} />
              <span>{stats.liked} liked</span>
            </div>
            <div className="flex items-center gap-2 text-stone-500">
              <CheckSquare size={14} />
              <span>{stats.selected} selected</span>
            </div>
          </div>
        )}

        {/* Tabs + grid toggle */}
        <div className="flex items-center justify-between mb-6 border-b border-stone-200">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setView(tab.value);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                  view === tab.value
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      view === tab.value
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Grid density toggle */}
          <div className="flex items-center gap-1 hidden sm:flex">
            <button
              onClick={() => setColumns(3)}
              className={`p-1.5 rounded transition-colors ${columns === 3 ? "text-stone-900" : "text-stone-300 hover:text-stone-500"}`}
            >
              <Grid2X2 size={16} />
            </button>
            <button
              onClick={() => setColumns(4)}
              className={`p-1.5 rounded transition-colors ${columns === 4 ? "text-stone-900" : "text-stone-300 hover:text-stone-500"}`}
            >
              <Grid3X3 size={16} />
            </button>
          </div>
        </div>

        {/* Folder browser */}
        {view === "folders" && (
          <FolderBrowser
            token={token}
            folderId={folderId}
            onNavigate={(id) => setFolderId(id)}
            onStatsChange={mutateStats}
          />
        )}

        {/* Empty states (flat modes) */}
        {flatMode && photos.length === 0 && !gallery && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-stone-100 animate-pulse" />
            ))}
          </div>
        )}

        {flatMode && photos.length === 0 && gallery && (
          <div className="text-center py-24">
            <p className="text-stone-400 text-sm">
              {filter === "liked"
                ? "No liked photos yet. Click the heart on any photo!"
                : filter === "selected"
                ? "No photos selected yet. Mark photos for your album."
                : "No photos in your gallery yet."}
            </p>
          </div>
        )}

        {/* Photo grid (flat) */}
        {flatMode && photos.length > 0 && (
          <div
            className={`grid gap-2 sm:gap-3 ${
              columns === 3
                ? "grid-cols-2 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            }`}
          >
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
        )}

        {/* Pagination */}
        {flatMode && pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs tracking-widest uppercase border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-stone-400 text-xs px-4">
              {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 text-xs tracking-widest uppercase border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>

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
    </>
  );
}
