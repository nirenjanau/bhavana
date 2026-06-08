"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Plus, Eye, UserCheck, UserX, Upload,
  KeyRound, Heart, CheckSquare, Image as ImageIcon,
  HardDrive, ChevronDown, ChevronUp, X, Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Client } from "@/types";
import { formatBytes, resetClientPassword, updateClient } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function fetcher(url: string, token: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
}

interface Props { token: string }

export default function ClientsPanel({ token }: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<Client | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: clients, mutate } = useSWR<Client[]>(
    `${API_URL}/api/admin/clients`,
    (url: string) => fetcher(url, token)
  );

  /* ── Create client ──────────────────────────────────────────────────────── */
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;
    try {
      const res = await fetch(`${API_URL}/api/admin/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: raw.name,
          email: raw.email,
          password: raw.password,
          storage_quota_gb: raw.storage_quota_gb ? parseInt(raw.storage_quota_gb, 10) : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create client");
      }
      toast.success(`Client "${raw.name}" created`);
      form.reset();
      setShowCreateForm(false);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setCreating(false);
    }
  }

  /* ── Toggle active ──────────────────────────────────────────────────────── */
  async function toggleActive(client: Client) {
    try {
      await updateClient(token, client.id, { is_active: !client.is_active });
      toast.success(`${client.name} ${client.is_active ? "deactivated" : "activated"}`);
      mutate();
    } catch {
      toast.error("Failed to update client");
    }
  }

  /* ── Delete client ──────────────────────────────────────────────────────── */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/clients/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete client");
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      mutate();
    } catch {
      toast.error("Failed to delete client");
    } finally {
      setDeleting(false);
    }
  }

  /* ── Reset password ─────────────────────────────────────────────────────── */
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    if (resetPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setResetting(true);
    try {
      await resetClientPassword(token, resetTarget.id, resetPassword);
      toast.success(`Password updated for ${resetTarget.name}`);
      setResetTarget(null);
      setResetPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setResetting(false);
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light text-stone-900">Clients</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-stone-700 transition-colors"
        >
          <Plus size={14} />
          Add Client
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-white border border-stone-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-stone-900">New Client</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-stone-400 hover:text-stone-900">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Full Name *</label>
              <input name="name" required placeholder="e.g. Priya & Rahul Sharma"
                className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Email Address *</label>
              <input name="email" type="email" required placeholder="priya@example.com"
                className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Temporary Password *</label>
              <input name="password" type="password" required minLength={8} placeholder="Min. 8 characters"
                className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Storage Quota (GB)</label>
              <input name="storage_quota_gb" type="number" min="1" max="2000" defaultValue={30}
                className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors" />
              <p className="text-stone-400 text-xs mt-1">~100 photos/GB · Default 30 GB ≈ 3,000 photos</p>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" disabled={creating}
                className="flex-1 bg-stone-900 text-white text-xs tracking-widest uppercase py-2.5 hover:bg-stone-700 transition-colors disabled:opacity-60">
                {creating ? "Creating…" : "Create Client"}
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)}
                className="flex-1 border border-stone-200 text-stone-500 text-xs tracking-widest uppercase py-2.5 hover:border-stone-900 hover:text-stone-900 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-stone-950/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-stone-900">Delete Client</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-stone-400 hover:text-stone-900">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-stone-500 mb-2">
              This will permanently delete{" "}
              <span className="font-semibold text-stone-900">{deleteTarget.name}</span> and{" "}
              <span className="font-semibold text-red-600">all their photos, folders, and data</span>.
              This cannot be undone.
            </p>
            <p className="text-xs text-stone-400 mb-6">{deleteTarget.email}</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white text-xs tracking-widest uppercase py-3 hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                <Trash2 size={13} />
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-stone-200 text-stone-500 text-xs tracking-widest uppercase py-3 hover:border-stone-900 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password reset modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-stone-950/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-stone-900">Reset Password</h3>
              <button onClick={() => { setResetTarget(null); setResetPassword(""); }}
                className="text-stone-400 hover:text-stone-900">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-stone-500 mb-6">
              Set a new login password for <span className="font-medium text-stone-900">{resetTarget.name}</span>
              <br /><span className="text-stone-400">{resetTarget.email}</span>
            </p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  minLength={8}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                  autoFocus
                />
              </div>
              <button type="submit" disabled={resetting}
                className="w-full bg-stone-900 text-white text-xs tracking-widest uppercase py-3 hover:bg-stone-700 transition-colors disabled:opacity-60">
                {resetting ? "Updating…" : "Set New Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Skeleton */}
      {!clients && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-stone-100 animate-pulse rounded" />
          ))}
        </div>
      )}

      {/* Empty */}
      {clients && clients.length === 0 && (
        <div className="text-center py-20 text-stone-400 text-sm">
          No clients yet. Create your first client above.
        </div>
      )}

      {/* Client rows */}
      {clients && clients.length > 0 && (
        <div className="space-y-2">
          {clients.map((client) => {
            const isExpanded = expandedId === client.id;
            const quota = Number(client.storage_quota_bytes ?? 0);
            const used = Number(client.storage_used_bytes ?? 0);
            const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
            const barColor = pct > 90 ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-stone-900";

            return (
              <div key={client.id} className="bg-white border border-stone-200 overflow-hidden">
                {/* Main row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-stone-600 uppercase">
                      {client.name.slice(0, 2)}
                    </span>
                  </div>

                  {/* Name + email */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900 truncate">{client.name}</p>
                    <p className="text-stone-400 text-xs truncate">{client.email}</p>
                  </div>

                  {/* Activity stats */}
                  <div className="hidden md:flex items-center gap-5 text-sm">
                    <span className="flex items-center gap-1.5 text-stone-500" title="Photos shared">
                      <ImageIcon size={13} className="text-stone-400" />
                      {client.total_photos ?? 0}
                    </span>
                    <span className="flex items-center gap-1.5 text-stone-500" title="Liked">
                      <Heart size={13} className="text-rose-400" />
                      {client.liked_photos ?? 0}
                    </span>
                    <span className="flex items-center gap-1.5 text-stone-500" title="Selected">
                      <CheckSquare size={13} className="text-emerald-500" />
                      {client.selected_photos ?? 0}
                    </span>
                  </div>

                  {/* Storage bar */}
                  <div className="hidden lg:block w-32">
                    <div className="h-1.5 bg-stone-100 rounded overflow-hidden">
                      <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-stone-400 text-xs mt-1 whitespace-nowrap">
                      {formatBytes(used)} / {formatBytes(quota)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`hidden sm:inline-flex items-center text-xs px-2.5 py-1 ${
                    client.is_active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
                  }`}>
                    {client.is_active ? "Active" : "Inactive"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Upload → client workspace */}
                    <a href={`/admin/clients/${client.id}`}
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="Upload photos / view workspace">
                      <Upload size={14} />
                    </a>
                    {/* View */}
                    <a href={`/admin/clients/${client.id}`}
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="View client workspace">
                      <Eye size={14} />
                    </a>
                    {/* Reset password */}
                    <button
                      onClick={() => setResetTarget(client)}
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="Reset password"
                    >
                      <KeyRound size={14} />
                    </button>
                    {/* Toggle active */}
                    <button
                      onClick={() => toggleActive(client)}
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title={client.is_active ? "Deactivate" : "Activate"}
                    >
                      {client.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(client)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete client"
                    >
                      <Trash2 size={14} />
                    </button>
                    {/* Expand */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : client.id)}
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="Show details"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-stone-100 px-5 py-4 bg-stone-50">
                    {/* Stats on mobile */}
                    <div className="md:hidden flex gap-6 mb-4 text-sm">
                      <span className="flex items-center gap-1.5 text-stone-500">
                        <ImageIcon size={13} className="text-stone-400" /> {client.total_photos ?? 0} photos
                      </span>
                      <span className="flex items-center gap-1.5 text-stone-500">
                        <Heart size={13} className="text-rose-400" /> {client.liked_photos ?? 0} liked
                      </span>
                      <span className="flex items-center gap-1.5 text-stone-500">
                        <CheckSquare size={13} className="text-emerald-500" /> {client.selected_photos ?? 0} selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      {/* Credentials */}
                      <div className="bg-white border border-stone-200 p-4">
                        <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Login Credentials</p>
                        <div className="space-y-2">
                          <div>
                            <span className="text-stone-400 text-xs">Email</span>
                            <p className="text-stone-900 font-medium text-sm break-all">{client.email}</p>
                          </div>
                          <div>
                            <span className="text-stone-400 text-xs">Password</span>
                            <p className="text-stone-400 text-xs italic">Stored securely — use Reset Password to change</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setResetTarget(client)}
                          className="mt-3 flex items-center gap-1.5 text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-900 px-3 py-2 transition-colors"
                        >
                          <KeyRound size={11} />
                          Reset Password
                        </button>
                      </div>

                      {/* Activity summary */}
                      <div className="bg-white border border-stone-200 p-4">
                        <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Activity</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-stone-500 text-sm"><ImageIcon size={13} /> Photos shared</span>
                            <span className="font-medium text-stone-900">{client.total_photos ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-stone-500 text-sm"><Heart size={13} className="text-rose-400" /> Liked</span>
                            <span className="font-medium text-stone-900">{client.liked_photos ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-stone-500 text-sm"><CheckSquare size={13} className="text-emerald-500" /> Selected</span>
                            <span className="font-medium text-stone-900">{client.selected_photos ?? 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-400 text-xs">Member since</span>
                            <span className="text-stone-500 text-xs">{new Date(client.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Storage */}
                      <div className="bg-white border border-stone-200 p-4">
                        <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">
                          <span className="flex items-center gap-1.5"><HardDrive size={12} /> Storage</span>
                        </p>
                        <div className="h-2 bg-stone-100 rounded overflow-hidden mb-2">
                          <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-stone-500 text-xs">{formatBytes(used)} used of {formatBytes(quota)} ({pct}%)</p>
                        <p className="text-stone-400 text-xs mt-1">{formatBytes(Math.max(0, quota - used))} remaining</p>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <a
                        href={`/admin/clients/${client.id}`}
                        className="flex items-center gap-1.5 bg-stone-900 text-white text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-stone-700 transition-colors"
                      >
                        <Upload size={12} />
                        Upload Photos
                      </a>
                      <a
                        href={`/admin/clients/${client.id}`}
                        className="flex items-center gap-1.5 border border-stone-300 text-stone-700 text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-stone-100 transition-colors"
                      >
                        <Eye size={12} />
                        View Workspace
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
