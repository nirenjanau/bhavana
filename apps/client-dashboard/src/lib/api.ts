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
