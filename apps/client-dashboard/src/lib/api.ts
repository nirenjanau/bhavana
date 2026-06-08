const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export async function toggleLike(photoId: string, token: string) {
  return apiFetch<{ is_liked: boolean }>(
    `/api/gallery/photos/${photoId}/like`,
    token,
    { method: "POST" }
  );
}

export async function toggleSelect(photoId: string, token: string) {
  return apiFetch<{ is_selected: boolean }>(
    `/api/gallery/photos/${photoId}/select`,
    token,
    { method: "POST" }
  );
}

export async function getDownloadUrl(photoId: string, token: string) {
  return apiFetch<{ url: string; filename: string }>(
    `/api/gallery/download/${photoId}`,
    token
  );
}

export async function bulkDownload(token: string, photoIds?: string[]) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${API}/api/gallery/download/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ photoIds }),
  });
  if (!res.ok) throw new Error("Bulk download failed");
  return res.blob();
}

import type { Folder, StorageUsage } from "@/types";

// ─── Admin: folders & storage ─────────────────────────────────────────────────

export function listFolders(
  token: string,
  clientId: string,
  parentId: string | null
) {
  const qs = new URLSearchParams({ client_id: clientId });
  if (parentId) qs.set("parent_id", parentId);
  return apiFetch<Folder[]>(`/api/admin/albums?${qs.toString()}`, token);
}

export function createFolder(
  token: string,
  data: {
    client_id: string;
    title: string;
    parent_album_id?: string | null;
    description?: string | null;
    shoot_date?: string | null;
  }
) {
  return apiFetch<Folder>(`/api/admin/albums`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function renameFolder(
  token: string,
  id: string,
  patch: Partial<{ title: string; description: string | null; parent_album_id: string | null }>
) {
  return apiFetch<Folder>(`/api/admin/albums/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteFolder(token: string, id: string) {
  return apiFetch<{ deleted: true }>(`/api/admin/albums/${id}`, token, {
    method: "DELETE",
  });
}

export function getClientStorage(token: string, clientId: string) {
  return apiFetch<StorageUsage>(`/api/admin/clients/${clientId}/storage`, token);
}

export function resetClientPassword(token: string, clientId: string, password: string) {
  return apiFetch<{ ok: true }>(`/api/admin/clients/${clientId}/password`, token, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function updateClient(
  token: string,
  id: string,
  patch: Partial<{ name: string; is_active: boolean; storage_quota_gb: number }>
) {
  return apiFetch<{
    id: string;
    name: string;
    is_active: boolean;
    storage_quota_bytes: string;
    storage_used_bytes: string;
  }>(`/api/admin/clients/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// ─── Human-friendly byte formatting ───────────────────────────────────────────

export function formatBytes(bytes: number | string): string {
  const n = typeof bytes === "string" ? Number(bytes) : bytes;
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const value = n / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
