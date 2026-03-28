"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { Menu, X } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center h-14 px-4 border-b bg-background/80 backdrop-blur-lg lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-2 font-semibold text-[14px] tracking-tight">Admin</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto max-w-5xl">
          {children}
        </main>

        <footer className="border-t bg-background/50">
          <div className="max-w-5xl px-4 sm:px-6 lg:px-8 py-5 text-xs text-muted-foreground">
            Made by{" "}
            <a
              href="https://recurohq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline font-medium"
            >
              Recuro
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
