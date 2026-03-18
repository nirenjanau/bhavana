"use client";

import { useState, useRef, useCallback } from "react";
import useSWR from "swr";
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { Client } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function fetcher(url: string, token: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
}

interface UploadItem {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface Props {
  token: string;
}

export default function UploadPanel({ token }: Props) {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: clients } = useSWR<Client[]>(
    `${API_URL}/api/admin/clients`,
    (url: string) => fetcher(url, token)
  );

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  function removeItem(index: number) {
    setItems((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUpload() {
    if (!selectedClientId) {
      toast.error("Please select a client first");
      return;
    }
    if (items.length === 0) {
      toast.error("No photos to upload");
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Uploading ${items.length} photos...`);

    const pendingItems = items.filter((i) => i.status === "pending");

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      const itemIndex = items.indexOf(item);

      setItems((prev) =>
        prev.map((it, idx) =>
          idx === itemIndex ? { ...it, status: "uploading" } : it
        )
      );

      try {
        const formData = new FormData();
        formData.append("photos", item.file);

        const uploadRes = await fetch(`${API_URL}/api/admin/photos/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        const { uploaded } = await uploadRes.json() as {
          uploaded: Array<{ id: string; error?: string }>;
        };

        const photoId = uploaded[0]?.id;
        if (!photoId) throw new Error("No photo ID returned");

        await fetch(`${API_URL}/api/admin/photos/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ client_id: selectedClientId, photo_ids: [photoId] }),
        });

        setItems((prev) =>
          prev.map((it, idx) =>
            idx === itemIndex ? { ...it, status: "done" } : it
          )
        );
      } catch {
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === itemIndex ? { ...it, status: "error", error: "Upload failed" } : it
          )
        );
      }
    }

    const doneCount = items.filter((i) => i.status === "done").length;
    toast.success(`${doneCount} photos uploaded and assigned!`, { id: toastId });
    setUploading(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-light text-stone-900 mb-8">Upload Photos</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: config */}
        <div className="space-y-6">
          {/* Client selector */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
              Assign to Client *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors bg-white"
            >
              <option value="">Select a client...</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading || items.length === 0 || !selectedClientId}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase py-3.5 hover:bg-stone-700 transition-colors disabled:opacity-40"
          >
            <Upload size={14} />
            {uploading
              ? "Uploading..."
              : `Upload ${items.filter((i) => i.status === "pending").length} Photos`}
          </button>

          {items.length > 0 && (
            <button
              onClick={() => {
                items.forEach((i) => URL.revokeObjectURL(i.preview));
                setItems([]);
              }}
              className="w-full text-xs tracking-widest uppercase text-stone-400 hover:text-stone-900 py-2 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Right: drop zone + previews */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded transition-all cursor-pointer p-12 text-center ${
              dragOver
                ? "border-stone-900 bg-stone-100"
                : "border-stone-200 hover:border-stone-400 bg-white"
            }`}
          >
            <ImageIcon size={32} className="mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 text-sm mb-1">
              Drag & drop photos here, or click to browse
            </p>
            <p className="text-stone-400 text-xs">
              JPEG, PNG, WebP, HEIC — up to 50MB per file
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {/* Preview grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {items.map((item, i) => (
                <div key={i} className="relative aspect-square bg-stone-100 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Status overlay */}
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 bg-stone-950/50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {item.status === "done" && (
                    <div className="absolute inset-0 bg-emerald-950/50 flex items-center justify-center">
                      <CheckCircle size={20} className="text-emerald-400" />
                    </div>
                  )}
                  {item.status === "error" && (
                    <div className="absolute inset-0 bg-red-950/50 flex items-center justify-center">
                      <AlertCircle size={20} className="text-red-400" />
                    </div>
                  )}

                  {/* Remove button */}
                  {item.status === "pending" && (
                    <button
                      onClick={() => removeItem(i)}
                      className="absolute top-1 right-1 p-1 bg-stone-950/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
