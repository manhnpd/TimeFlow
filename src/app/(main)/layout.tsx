"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/upcoming", icon: Calendar, label: "Lịch trình" },
  { href: "/analytics", icon: BarChart3, label: "Báo cáo" },
  { href: "/admin", icon: ShieldCheck, label: "Quản trị" },
  { href: "/settings", icon: Settings, label: "Cài đặt" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const title = NAV_ITEMS.find((i) => i.href === pathname)?.label ?? "Dashboard";

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
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">ScheduleMe</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Smart Planner</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">Menu chính</span>
          {NAV_ITEMS.map((item) => (
            <Link
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
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground text-sm font-medium transition-colors"
          >
            <Settings size={18} className="text-muted-foreground" />
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
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
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-secondary border border-border rounded-full px-4 py-1.5 w-64 focus-within:border-primary transition-all">
              <Search size={16} className="text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                className="bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground w-full ml-2 p-0 h-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
              </button>
              <button className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
                <HelpCircle size={20} />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 overflow-hidden ml-2 cursor-pointer flex items-center justify-center">
                <span className="text-primary text-xs font-bold">U</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
