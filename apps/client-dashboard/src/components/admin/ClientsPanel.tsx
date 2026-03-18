"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, UserCheck, UserX, Eye } from "lucide-react";
import toast from "react-hot-toast";
import type { Client } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function fetcher(url: string, token: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
}

interface Props {
  token: string;
}

export default function ClientsPanel({ token }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data: clients, mutate } = useSWR<Client[]>(
    `${API_URL}/api/admin/clients`,
    (url: string) => fetcher(url, token)
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(`${API_URL}/api/admin/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create client");
      }
      toast.success("Client created successfully");
      form.reset();
      setShowForm(false);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(client: Client) {
    try {
      await fetch(`${API_URL}/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !client.is_active }),
      });
      toast.success(`Client ${client.is_active ? "deactivated" : "activated"}`);
      mutate();
    } catch {
      toast.error("Failed to update client");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light text-stone-900">Clients</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-stone-700 transition-colors"
        >
          <Plus size={14} />
          Add Client
        </button>
      </div>

      {/* Create client form */}
      {showForm && (
        <div className="bg-white border border-stone-200 p-6 mb-8">
          <h3 className="text-lg font-medium text-stone-900 mb-6">New Client</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                Full Name *
              </label>
              <input
                name="name"
                required
                className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                placeholder="Priya & Rahul Sharma"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                placeholder="priya@example.com"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                Temporary Password *
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="flex items-end gap-3">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-stone-900 text-white text-xs tracking-widest uppercase py-2.5 hover:bg-stone-700 transition-colors disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Client"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-stone-200 text-stone-500 text-xs tracking-widest uppercase py-2.5 hover:border-stone-900 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clients table */}
      {!clients && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-stone-100 animate-pulse rounded" />
          ))}
        </div>
      )}

      {clients && clients.length === 0 && (
        <div className="text-center py-16 text-stone-400 text-sm">
          No clients yet. Create your first client above.
        </div>
      )}

      {clients && clients.length > 0 && (
        <div className="bg-white border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-5 py-3 text-xs tracking-widest uppercase text-stone-400 font-normal">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-xs tracking-widest uppercase text-stone-400 font-normal hidden sm:table-cell">
                  Photos
                </th>
                <th className="text-left px-5 py-3 text-xs tracking-widest uppercase text-stone-400 font-normal hidden md:table-cell">
                  Selected
                </th>
                <th className="text-left px-5 py-3 text-xs tracking-widest uppercase text-stone-400 font-normal">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-900">{client.name}</p>
                    <p className="text-stone-400 text-xs">{client.email}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-stone-600">
                    {client.total_photos}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-stone-600">
                    {client.selected_photos}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 ${
                        client.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {client.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <a
                        href={`/admin/clients/${client.id}`}
                        className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
                        title="View client"
                      >
                        <Eye size={14} />
                      </a>
                      <button
                        onClick={() => toggleActive(client)}
                        className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
                        title={client.is_active ? "Deactivate" : "Activate"}
                      >
                        {client.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
