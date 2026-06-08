"use client";

import { useState, useEffect } from "react";
import { Users, Upload, CheckSquare, LayoutDashboard, LogOut, Heart } from "lucide-react";
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
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="md:hidden bg-stone-900 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-serif text-sm tracking-widest uppercase">Bhavana Studio</p>
          <p className="text-stone-400 text-xs">Admin Panel</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-stone-400 hover:text-white text-xs uppercase tracking-widest"
        >
          Sign Out
        </button>
      </header>

      {/* Mobile tab bar */}
      <nav className="md:hidden bg-stone-800 flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase transition-colors ${
              activeTab === tab.id
                ? "bg-stone-700 text-white"
                : "text-stone-400 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-stone-900 text-white flex-col flex-shrink-0">
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
      <main className="flex-1 overflow-auto pb-4 md:pb-0">
        <div className="p-4 md:p-8">
          {activeTab === "overview" && <OverviewPanel token={token} onNavigate={setActiveTab} />}
          {activeTab === "clients" && <ClientsPanel token={token} />}
          {activeTab === "upload" && <UploadPanel token={token} />}
          {activeTab === "selections" && <SelectionsPanel token={token} />}
        </div>
      </main>
    </div>
  );
}

function OverviewPanel({ token, onNavigate }: { token: string; onNavigate: (tab: AdminTab) => void }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const [stats, setStats] = useState<{
    clients: number;
    totalPhotos: number;
    selections: number;
    liked: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/admin/clients`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/selections`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([clients, selections]) => {
      const clientList = Array.isArray(clients) ? clients : [];
      setStats({
        clients: clientList.length,
        totalPhotos: clientList.reduce((s: number, c: { total_photos?: number }) => s + Number(c.total_photos ?? 0), 0),
        selections: Array.isArray(selections) ? selections.length : 0,
        liked: clientList.reduce((s: number, c: { liked_photos?: number }) => s + Number(c.liked_photos ?? 0), 0),
      });
    }).catch(() => {});
  }, [API_URL, token]);

  return (
    <div>
      <h2 className="text-2xl font-light text-stone-900 mb-8">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Clients", value: stats?.clients ?? "—", icon: <Users size={20} />, color: "text-stone-400" },
          { label: "Photos Shared", value: stats?.totalPhotos ?? "—", icon: <Upload size={20} />, color: "text-stone-400" },
          { label: "Liked by Clients", value: stats?.liked ?? "—", icon: <Heart size={20} />, color: "text-rose-400" },
          { label: "Selected by Clients", value: stats?.selections ?? "—", icon: <CheckSquare size={20} />, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 p-6">
            <div className={`flex items-center gap-3 mb-4 ${s.color}`}>{s.icon}</div>
            <p className="text-3xl font-light text-stone-900">{s.value}</p>
            <p className="text-stone-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-stone-200 p-6">
        <h3 className="text-xs tracking-widest uppercase text-stone-400 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate("upload")}
            className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-3 hover:bg-stone-700 transition-colors"
          >
            <Upload size={14} />
            Upload Photos
          </button>
          <button
            onClick={() => onNavigate("clients")}
            className="flex items-center gap-2 border border-stone-300 text-stone-700 text-xs tracking-widest uppercase px-5 py-3 hover:bg-stone-100 transition-colors"
          >
            <Users size={14} />
            Manage Clients
          </button>
          <button
            onClick={() => onNavigate("selections")}
            className="flex items-center gap-2 border border-stone-300 text-stone-700 text-xs tracking-widest uppercase px-5 py-3 hover:bg-stone-100 transition-colors"
          >
            <CheckSquare size={14} />
            View Selections
          </button>
        </div>
      </div>
    </div>
  );
}
