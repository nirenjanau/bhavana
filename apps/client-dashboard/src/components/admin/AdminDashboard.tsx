"use client";

import { useState } from "react";
import { Users, Upload, CheckSquare, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import ClientsPanel from "./ClientsPanel";
import UploadPanel from "./UploadPanel";
import SelectionsPanel from "./SelectionsPanel";

type AdminTab = "overview" | "clients" | "upload" | "selections";

interface Props {
  token: string;
}

export default function AdminDashboard({ token }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { id: "clients", label: "Clients", icon: <Users size={16} /> },
    { id: "upload", label: "Upload Photos", icon: <Upload size={16} /> },
    { id: "selections", label: "Selections", icon: <CheckSquare size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-stone-800">
          <h1 className="font-serif text-lg font-light tracking-widest uppercase">
            Bhavana Studio
          </h1>
          <p className="text-stone-400 text-xs mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                activeTab === tab.id
                  ? "bg-stone-700 text-white"
                  : "text-stone-400 hover:text-white hover:bg-stone-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === "overview" && <OverviewPanel token={token} />}
          {activeTab === "clients" && <ClientsPanel token={token} />}
          {activeTab === "upload" && <UploadPanel token={token} />}
          {activeTab === "selections" && <SelectionsPanel token={token} />}
        </div>
      </main>
    </div>
  );
}

function OverviewPanel({ token }: { token: string }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const [stats, setStats] = useState<{
    clients: number;
    photos: number;
    selections: number;
  } | null>(null);

  // Load stats on mount
  useState(() => {
    Promise.all([
      fetch(`${API_URL}/api/admin/clients`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/photos?limit=1`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/selections`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([clients, photos, selections]) => {
      setStats({
        clients: Array.isArray(clients) ? clients.length : 0,
        photos: Array.isArray(photos) ? photos.length : 0,
        selections: Array.isArray(selections) ? selections.length : 0,
      });
    }).catch(() => {});
  });

  return (
    <div>
      <h2 className="text-2xl font-light text-stone-900 mb-8">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Clients", value: stats?.clients ?? "—", icon: <Users size={20} /> },
          { label: "Total Photos", value: stats?.photos ?? "—", icon: <Upload size={20} /> },
          { label: "Client Selections", value: stats?.selections ?? "—", icon: <CheckSquare size={20} /> },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-4 text-stone-400">{s.icon}</div>
            <p className="text-3xl font-light text-stone-900">{s.value}</p>
            <p className="text-stone-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
