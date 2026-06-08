"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  FolderPlus,
  Upload,
  Folder as FolderIcon,
  ChevronRight,
  Home,
  Trash2,
  Pencil,
  HardDrive,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { Client, Folder, StorageUsage } from "@/types";
import {
  createFolder,
  deleteFolder,
  renameFolder,
  formatBytes,
  updateClient,
} from "@/lib/api";
import { compressImage } from "@/lib/compress";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function fetcher([url, token]: [string, string]) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => {
    if (!r.ok) throw new Error("Request failed");
    return r.json();
  });
}

interface Props {
  token: string;
  clientId: string;
  folderId: string | null;
}

export default function ClientWorkspace({ token, clientId, folderId }: Props) {
  // ─── Data ────────────────────────────────────────────────────────────────
  const { data: client, mutate: mutateClient } = useSWR<Client>(
    [`${API_URL}/api/admin/clients`, token],
    ([url, t]: [string, string]) =>
      fetcher([url, t]).then((list: Client[]) => list.find((c) => c.id === clientId)!)
  );

  const { data: storage, mutate: mutateStorage } = useSWR<StorageUsage>(
    [`${API_URL}/api/admin/clients/${clientId}/storage`, token],
    fetcher
  );

  const foldersKey = useMemo(() => {
    const qs = new URLSearchParams({ client_id: clientId });
    if (folderId) qs.set("parent_id", folderId);
    return `${API_URL}/api/admin/albums?${qs.toString()}`;
  }, [clientId, folderId]);

  const { data: folders, mutate: mutateFolders } = useSWR<Folder[]>(
    [foldersKey, token],
    fetcher
  );

  const { data: breadcrumb } = useSWR<Array<{ id: string; title: string }>>(
    folderId ? [`${API_URL}/api/admin/albums/${folderId}/breadcrumb`, token] : null,
    fetcher
  );

  // Client-scoped photo list (we reuse the admin photos endpoint filtered by
  // album_id via the gallery tree view through the /api/gallery route would
  // require the admin to have access; instead fetch this client's photos in
  // the current folder via /api/admin/clients/:id).
  const { data: detail, mutate: mutateDetail } = useSWR<{
    photos: Array<{
      id: string;
      filename: string;
      thumbnail_url: string;
      album_id: string | null;
      file_size: number;
      is_selected: boolean;
      is_liked: boolean;
    }>;
  }>(
    [`${API_URL}/api/admin/clients/${clientId}`, token],
    fetcher
  );

  const photosInFolder = useMemo(() => {
    if (!detail?.photos) return [];
    return detail.photos.filter((p) => (folderId ? p.album_id === folderId : p.album_id === null));
  }, [detail, folderId]);

  // ─── UI state ────────────────────────────────────────────────────────────
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingQuota, setEditingQuota] = useState(false);
  const [quotaDraft, setQuotaDraft] = useState("");
  const [uploadItems, setUploadItems] = useState<
    Array<{ file: File; preview: string; status: "pending" | "uploading" | "done" | "error"; error?: string }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Derived ─────────────────────────────────────────────────────────────
  const quotaBytes = Number(client?.storage_quota_bytes ?? storage?.quota_bytes ?? 0);
  const usedBytes = Number(client?.storage_used_bytes ?? storage?.used_bytes ?? 0);
  const pct = quotaBytes > 0 ? Math.min(100, Math.round((usedBytes / quotaBytes) * 100)) : 0;
  const remainingBytes = Math.max(0, quotaBytes - usedBytes);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleCreateFolder = async () => {
    const title = newFolderName.trim();
    if (!title) return;
    try {
      await createFolder(token, {
        client_id: clientId,
        title,
        parent_album_id: folderId,
      });
      setNewFolderName("");
      setCreatingFolder(false);
      await mutateFolders();
      toast.success(`Folder "${title}" created`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create folder");
    }
  };

  const handleRenameFolder = async (folder: Folder) => {
    const next = prompt("Rename folder", folder.title)?.trim();
    if (!next || next === folder.title) return;
    try {
      await renameFolder(token, folder.id, { title: next });
      await mutateFolders();
      toast.success("Folder renamed");
    } catch {
      toast.error("Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (!confirm(`Delete folder "${folder.title}" and all its sub-folders? Photos inside will be moved to the parent.`)) {
      return;
    }
    try {
      await deleteFolder(token, folder.id);
      await mutateFolders();
      toast.success("Folder deleted");
    } catch {
      toast.error("Failed to delete folder");
    }
  };

  const handleUpdateQuota = async () => {
    const gb = parseInt(quotaDraft, 10);
    if (!Number.isFinite(gb) || gb <= 0) {
      toast.error("Enter a positive whole number of GB");
      return;
    }
    try {
      await updateClient(token, clientId, { storage_quota_gb: gb });
      await Promise.all([mutateClient(), mutateStorage()]);
      setEditingQuota(false);
      toast.success(`Quota set to ${gb} GB`);
    } catch {
      toast.error("Failed to update quota");
    }
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      }));
    setUploadItems((prev) => [...prev, ...next]);
  }, []);

  const handleUpload = async () => {
    if (uploadItems.length === 0) return;
    const totalBytes = uploadItems.reduce((sum, it) => sum + it.file.size, 0);
    if (totalBytes > remainingBytes) {
      toast.error(
        `Not enough storage. Remaining: ${formatBytes(remainingBytes)}, needs: ${formatBytes(totalBytes)}`
      );
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Uploading ${uploadItems.length} photo(s)...`);

    for (let i = 0; i < uploadItems.length; i++) {
      const item = uploadItems[i];
      if (item.status !== "pending") continue;

      setUploadItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: "uploading" } : it))
      );

      try {
        const compressed = await compressImage(item.file, 2);
        const fd = new FormData();
        fd.append("photos", compressed);
        fd.append("client_id", clientId);
        if (folderId) fd.append("album_id", folderId);

        const res = await fetch(`${API_URL}/api/admin/photos/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Upload failed");
        }

        const body = (await res.json()) as {
          uploaded: unknown[];
          errors: Array<{ filename: string; error: string }>;
        };
        if (body.errors && body.errors.length > 0) {
          throw new Error(body.errors[0].error);
        }

        setUploadItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: "done" } : it))
        );
      } catch (err) {
        setUploadItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : it
          )
        );
      }
    }

    const done = uploadItems.filter((i) => i.status === "done").length;
    toast.success(`Upload finished`, { id: toastId });
    setUploading(false);
    await Promise.all([mutateDetail(), mutateStorage(), mutateClient()]);
  };

  const clearUploadQueue = () => {
    uploadItems.forEach((i) => URL.revokeObjectURL(i.preview));
    setUploadItems([]);
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  const crumbs = breadcrumb ?? [];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 mb-4"
          >
            <ArrowLeft size={12} />
            Back to Admin
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Client Workspace</p>
              <h1 className="text-3xl font-light text-stone-900">{client?.name ?? "Loading…"}</h1>
              <p className="text-stone-500 text-sm mt-1">{client?.email}</p>
            </div>

            {/* Quota bar */}
            <div className="w-full md:w-80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-1.5 text-stone-500">
                  <HardDrive size={12} />
                  Storage
                </span>
                {!editingQuota ? (
                  <button
                    onClick={() => {
                      setQuotaDraft(String(Math.round(quotaBytes / 1024 / 1024 / 1024)));
                      setEditingQuota(true);
                    }}
                    className="text-stone-400 hover:text-stone-900 tracking-widest uppercase"
                  >
                    Edit quota
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={quotaDraft}
                      onChange={(e) => setQuotaDraft(e.target.value)}
                      className="w-16 border border-stone-300 px-2 py-0.5 text-xs"
                      min="1"
                    />
                    <span className="text-stone-400">GB</span>
                    <button
                      onClick={handleUpdateQuota}
                      className="text-emerald-600 hover:text-emerald-800 tracking-widest uppercase ml-1"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingQuota(false)}
                      className="text-stone-400 hover:text-stone-900 ml-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div className="h-2 w-full bg-stone-200 rounded overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-stone-900"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-stone-500 mt-1.5">
                {formatBytes(usedBytes)} of {formatBytes(quotaBytes)} used · {formatBytes(remainingBytes)} left
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mt-6 text-sm overflow-x-auto">
            <Link
              href={`/admin/clients/${clientId}`}
              className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-100 ${
                folderId ? "text-stone-500" : "text-stone-900 font-medium"
              }`}
            >
              <Home size={14} />
              All folders
            </Link>
            {crumbs.map((c) => (
              <span key={c.id} className="flex items-center gap-1.5">
                <ChevronRight size={14} className="text-stone-300" />
                <Link
                  href={`/admin/clients/${clientId}?folder=${c.id}`}
                  className={`px-2 py-1 rounded hover:bg-stone-100 ${
                    c.id === folderId ? "text-stone-900 font-medium" : "text-stone-500"
                  }`}
                >
                  {c.title}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-10">
        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {creatingFolder ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") {
                    setCreatingFolder(false);
                    setNewFolderName("");
                  }
                }}
                placeholder="e.g. Cam 1, Drone, Candids"
                className="border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-stone-900"
              />
              <button
                onClick={handleCreateFolder}
                className="bg-stone-900 text-white text-xs tracking-widest uppercase px-4 py-2 hover:bg-stone-700"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setCreatingFolder(false);
                  setNewFolderName("");
                }}
                className="text-stone-400 hover:text-stone-900 text-xs tracking-widest uppercase px-2 py-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreatingFolder(true)}
              className="flex items-center gap-2 bg-white border border-stone-300 text-stone-900 text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-stone-100"
            >
              <FolderPlus size={14} />
              New Folder
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-stone-700"
          >
            <Upload size={14} />
            Upload to this folder
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>

        {/* Folders grid */}
        <section>
          <h2 className="text-xs tracking-widest uppercase text-stone-400 mb-4">Folders</h2>

          {!folders ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-stone-100 animate-pulse rounded" />
              ))}
            </div>
          ) : folders.length === 0 ? (
            <div className="border border-dashed border-stone-200 bg-white p-8 text-center text-sm text-stone-400">
              No folders here yet. Create one to organise this client's shoot (e.g. <em>Cam 1</em>, <em>Drone</em>, <em>Candids</em>).
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {folders.map((f) => (
                <div
                  key={f.id}
                  className="group relative bg-white border border-stone-200 hover:border-stone-900 transition-colors"
                >
                  <Link
                    href={`/admin/clients/${clientId}?folder=${f.id}`}
                    className="block p-4"
                  >
                    <FolderIcon size={28} className="text-stone-500 mb-3" />
                    <p className="text-stone-900 font-medium text-sm truncate">{f.title}</p>
                    <p className="text-stone-400 text-xs mt-0.5">
                      {f.folder_count} subfolder{f.folder_count === 1 ? "" : "s"} · {f.photo_count} photo{f.photo_count === 1 ? "" : "s"}
                    </p>
                  </Link>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleRenameFolder(f)}
                      className="p-1.5 bg-white border border-stone-200 rounded hover:bg-stone-100 text-stone-500"
                      title="Rename"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(f)}
                      className="p-1.5 bg-white border border-stone-200 rounded hover:bg-red-50 hover:border-red-300 text-stone-500 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upload queue */}
        {uploadItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs tracking-widest uppercase text-stone-400">
                Upload Queue ({uploadItems.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-stone-900 text-white text-xs tracking-widest uppercase px-4 py-2 hover:bg-stone-700 disabled:opacity-40"
                >
                  {uploading ? "Uploading…" : `Start Upload`}
                </button>
                <button
                  onClick={clearUploadQueue}
                  disabled={uploading}
                  className="text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 px-3 py-2"
                >
                  Clear
                </button>
              </div>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed p-4 rounded grid grid-cols-3 sm:grid-cols-6 gap-2 ${
                dragOver ? "border-stone-900 bg-stone-100" : "border-stone-200 bg-white"
              }`}
            >
              {uploadItems.map((item, i) => (
                <div key={i} className="relative aspect-square bg-stone-100 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 bg-stone-950/60 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {item.status === "done" && (
                    <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center">
                      <CheckCircle size={22} className="text-emerald-300" />
                    </div>
                  )}
                  {item.status === "error" && (
                    <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center" title={item.error}>
                      <AlertCircle size={22} className="text-red-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photos in current folder */}
        <section>
          <h2 className="text-xs tracking-widest uppercase text-stone-400 mb-4">
            Photos in this folder
          </h2>
          {!detail ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-stone-100 animate-pulse" />
              ))}
            </div>
          ) : photosInFolder.length === 0 ? (
            <div className="border border-dashed border-stone-200 bg-white p-8 text-center text-sm text-stone-400">
              <ImageIcon size={24} className="mx-auto mb-3 text-stone-300" />
              No photos in this folder yet. Use <strong>Upload to this folder</strong> above — photos are auto-compressed to 2 MB.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {photosInFolder.map((p) => (
                <div key={p.id} className="relative aspect-square bg-stone-100 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnail_url}
                    alt={p.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {p.is_selected && (
                    <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white rounded-full p-0.5">
                      <CheckCircle size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
