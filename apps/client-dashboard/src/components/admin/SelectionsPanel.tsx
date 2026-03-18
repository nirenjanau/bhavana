"use client";

import useSWR from "swr";
import Image from "next/image";
import { Download } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function fetcher(url: string, token: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
}

interface Selection {
  client_id: string;
  client_name: string;
  client_email: string;
  photo_id: string;
  filename: string;
  thumbnail_url: string;
  preview_url: string;
  selected_at: string;
}

interface Props {
  token: string;
}

export default function SelectionsPanel({ token }: Props) {
  const { data: selections } = useSWR<Selection[]>(
    `${API_URL}/api/admin/selections`,
    (url: string) => fetcher(url, token)
  );

  if (!selections) {
    return (
      <div>
        <h2 className="text-2xl font-light text-stone-900 mb-8">Client Selections</h2>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-stone-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Group by client
  const byClient = selections.reduce<Record<string, { name: string; email: string; photos: Selection[] }>>(
    (acc, s) => {
      if (!acc[s.client_id]) {
        acc[s.client_id] = { name: s.client_name, email: s.client_email, photos: [] };
      }
      acc[s.client_id].photos.push(s);
      return acc;
    },
    {}
  );

  if (Object.keys(byClient).length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-light text-stone-900 mb-8">Client Selections</h2>
        <div className="text-center py-16 text-stone-400 text-sm">
          No client selections yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light text-stone-900">Client Selections</h2>
        <span className="text-stone-400 text-sm">
          {selections.length} total selections across {Object.keys(byClient).length} clients
        </span>
      </div>

      <div className="space-y-10">
        {Object.entries(byClient).map(([clientId, { name, email, photos }]) => (
          <div key={clientId} className="bg-white border border-stone-200 overflow-hidden">
            {/* Client header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div>
                <p className="font-medium text-stone-900">{name}</p>
                <p className="text-stone-400 text-xs">{email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-stone-500 text-sm">
                  {photos.length} photo{photos.length !== 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={async () => {
                    const blob = await fetch(`${API_URL}/api/gallery/download/bulk`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ photoIds: photos.map((p) => p.photo_id) }),
                    }).then((r) => r.blob());
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${name.replace(/\s/g, "-")}-selections.zip`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-stone-500 border border-stone-200 px-3 py-2 hover:border-stone-900 hover:text-stone-900 transition-colors"
                >
                  <Download size={12} />
                  Download All
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="p-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {photos.map((photo) => (
                <div key={photo.photo_id} className="relative aspect-square bg-stone-100 overflow-hidden group">
                  <Image
                    src={photo.thumbnail_url}
                    alt={photo.filename}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                  <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <p className="text-white text-xs text-center px-1 truncate">
                      {photo.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
