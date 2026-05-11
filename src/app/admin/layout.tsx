"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Search,
  Bell,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Người dùng" },
  { href: "/admin/reports", icon: BarChart3, label: "Báo cáo" },
  { href: "/admin/system", icon: ShieldCheck, label: "Hệ thống" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-[260px] bg-sidebar border-r border-sidebar-border p-4 gap-6 shrink-0 h-screen transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">TimeFlow</h1>
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">Quản trị</span>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm font-medium",
                pathname === item.href
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon size={18} className={pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
              {item.label}
            </a>
          ))}
        </nav>

        {/* Bottom */}
        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground text-sm font-medium transition-colors"
          >
            <Calendar size={18} className="text-muted-foreground" />
            Về trang người dùng
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive text-sm font-medium transition-colors"
          >
            <LogOut size={18} className="text-muted-foreground" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 w-full bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-lg font-bold text-foreground">Quản trị hệ thống</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-secondary border border-border rounded-full px-4 py-1.5 w-64 focus-within:border-primary transition-all">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground w-full ml-2 outline-none"
              />
            </div>
            <button className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
            </button>
            <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 overflow-hidden ml-2 flex items-center justify-center">
              <ShieldCheck size={16} className="text-amber-500" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
