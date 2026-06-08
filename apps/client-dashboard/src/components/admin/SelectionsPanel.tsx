"use client";

import { useState } from "react";
import useSWR from "swr";
import { Download, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function fetcher(url: string, token: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
}

interface SelectionRow {
  client_id: string;
  client_name: string;
  client_email: string;
  photo_id: string;
  filename: string;
  selected_at: string;
}

interface LikeRow {
  client_id: string;
  client_name: string;
  client_email: string;
  photo_id: string;
  filename: string;
  liked_at: string;
}

interface ClientGroup {
  name: string;
  email: string;
  selected: SelectionRow[];
  liked: LikeRow[];
}

interface Props {
  token: string;
}

function CopyButton({ filenames }: { filenames: string[] }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(filenames.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs tracking-widest uppercase border border-stone-200 px-3 py-2 transition-colors hover:border-stone-900 hover:text-stone-900 text-stone-500"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function FilenameList({ files }: { files: Array<{ filename: string; date: string }> }) {
  if (files.length === 0) {
    return <p className="text-stone-300 text-xs italic px-2 py-3">None</p>;
  }

  const half = Math.ceil(files.length / 2);
  const col1 = files.slice(0, half);
  const col2 = files.slice(half);

  return (
    <div className="grid grid-cols-2 gap-x-4">
      {[col1, col2].map((col, ci) => (
        <div key={ci} className="divide-y divide-stone-50">
          {col.map((f, i) => (
            <div
              key={f.filename + i}
              className="flex items-center gap-3 py-2 px-2 hover:bg-stone-50"
            >
              <span className="text-stone-300 text-xs w-5 text-right flex-shrink-0">
                {ci === 0 ? i + 1 : half + i + 1}
              </span>
              <span className="text-stone-700 text-sm font-mono truncate flex-1">
                {f.filename}
              </span>
              <span className="text-stone-300 text-xs flex-shrink-0 hidden sm:block">
                {new Date(f.date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ClientCard({
  clientId,
  group,
  token,
}: {
  clientId: string;
  group: ClientGroup;
  token: string;
}) {
  const [open, setOpen] = useState(false);

  const selectedFiles = group.selected.map((p) => ({ filename: p.filename, date: p.selected_at }));
  const likedFiles = group.liked.map((p) => ({ filename: p.filename, date: p.liked_at }));

  return (
    <div className="bg-white border border-stone-200 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors text-left"
      >
        <div>
          <p className="font-medium text-stone-900">{group.name}</p>
          <p className="text-stone-400 text-xs">{group.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              {group.selected.length} selected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
              {group.liked.length} liked
            </span>
          </div>
          {open ? (
            <ChevronUp size={16} className="text-stone-400 flex-shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-stone-400 flex-shrink-0" />
          )}
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="border-t border-stone-100">
          {/* Two-column section layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-100">

            {/* Selected column */}
            <div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-xs tracking-widest uppercase text-stone-500 font-medium">
                    Selected — {group.selected.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton filenames={group.selected.map((p) => p.filename)} />
                  <button
                    onClick={async () => {
                      const blob = await fetch(`${API_URL}/api/gallery/download/bulk`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ photoIds: group.selected.map((p) => p.photo_id) }),
                      }).then((r) => r.blob());
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${group.name.replace(/\s/g, "-")}-selected.zip`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-stone-500 border border-stone-200 px-3 py-2 hover:border-stone-900 hover:text-stone-900 transition-colors"
                  >
                    <Download size={12} />
                    ZIP
                  </button>
                </div>
              </div>
              <div className="p-2">
                <FilenameList files={selectedFiles} />
              </div>
            </div>

            {/* Liked column */}
            <div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                  <span className="text-xs tracking-widest uppercase text-stone-500 font-medium">
                    Liked — {group.liked.length}
                  </span>
                </div>
                <CopyButton filenames={group.liked.map((p) => p.filename)} />
              </div>
              <div className="p-2">
                <FilenameList files={likedFiles} />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function SelectionsPanel({ token }: Props) {
  const { data: selections } = useSWR<SelectionRow[]>(
    `${API_URL}/api/admin/selections`,
    (url: string) => fetcher(url, token)
  );
  const { data: likes } = useSWR<LikeRow[]>(
    `${API_URL}/api/admin/likes`,
    (url: string) => fetcher(url, token)
  );

  if (!selections || !likes) {
    return (
      <div>
        <h2 className="text-2xl font-light text-stone-900 mb-8">Client Selections</h2>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-stone-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Merge selections and likes into one map keyed by client_id
  const byClient: Record<string, ClientGroup> = {};

  for (const s of selections) {
    if (!byClient[s.client_id]) {
      byClient[s.client_id] = { name: s.client_name, email: s.client_email, selected: [], liked: [] };
    }
    byClient[s.client_id].selected.push(s);
  }

  for (const l of likes) {
    if (!byClient[l.client_id]) {
      byClient[l.client_id] = { name: l.client_name, email: l.client_email, selected: [], liked: [] };
    }
    byClient[l.client_id].liked.push(l);
  }

  const clientIds = Object.keys(byClient);

  if (clientIds.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-light text-stone-900 mb-8">Client Selections</h2>
        <div className="text-center py-16 text-stone-400 text-sm">
          No client selections or likes yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light text-stone-900">Client Selections</h2>
        <div className="flex gap-4 text-xs text-stone-400">
          <span>{selections.length} selected</span>
          <span>{likes.length} liked</span>
          <span>{clientIds.length} client{clientIds.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="space-y-3">
        {clientIds.map((id) => (
          <ClientCard key={id} clientId={id} group={byClient[id]} token={token} />
        ))}
      </div>
    </div>
  );
}
