"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Search,
  FileCheck2,
  FileText,
  Route,
  CalendarDays,
  FolderLock,
  ListChecks,
  Bell,
  Compass,
  MessageSquare,
  UserRound,
  FileBarChart,
  Shield,
  Menu,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/opportunities", label: "Opportunities", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
  { href: "/eligibility", label: "Eligibility", icon: FileCheck2 },
  { href: "/document-explainer", label: "Document AI", icon: FileText },
  { href: "/roadmap", label: "Roadmap", icon: Route },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/vault", label: "Document Vault", icon: FolderLock },
  { href: "/tracker", label: "Tracker", icon: ListChecks },
  { href: "/career", label: "Career Advisor", icon: Sparkles },
  { href: "/chat", label: "AI Assistant", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/admin", label: "Admin", icon: Shield },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const unread =
          item.href === "/notifications"
            ? NOTIFICATIONS.filter((n) => !n.read).length
            : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-indigo-500/15 via-blue-500/10 to-indigo-500/5 text-indigo-900 font-semibold shadow-xs border-l-2 border-indigo-600 pl-2.5"
                : "text-muted-foreground hover:bg-white/80 hover:text-foreground hover:translate-x-0.5"
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                active
                  ? "bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-sm shadow-indigo-500/30"
                  : "text-muted-foreground group-hover:text-indigo-600 group-hover:scale-105"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className="flex-1">{item.label}</span>
            {unread > 0 && (
              <Badge className="h-5 min-w-5 justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-1.5 text-[10px] text-white shadow-xs">
                {unread}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { profile, logout, isDemo } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AK";

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <Logo href="/dashboard" />
      </div>
      {isDemo && (
        <div className="mx-3 mb-2 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/50 px-3 py-2 text-xs text-amber-900 shadow-xs">
          Demo mode active — full database access.
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <NavLinks onNavigate={() => setOpen(false)} />
      </div>
      <Separator className="bg-indigo-100/60" />
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-indigo-100/60 bg-white/70 p-2.5 shadow-xs backdrop-blur-sm">
          <Avatar className="h-9 w-9 ring-2 ring-indigo-200/60">
            <AvatarFallback className="bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white text-xs font-semibold shadow-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{profile?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-indigo-100/80 bg-white/80 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="gradient-light-bg flex min-h-screen text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-indigo-100/70 bg-white/80 backdrop-blur-2xl shadow-sm shadow-indigo-950/5 lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-indigo-100/70 bg-white/75 px-4 backdrop-blur-xl shadow-xs sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="lg:hidden" />}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-white/90 backdrop-blur-2xl">
              {sidebar}
            </SheetContent>
          </Sheet>

          <form onSubmit={onSearch} className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try “scholarships under ₹8 lakh income”'
              className="h-10 border-indigo-100/80 bg-white/80 shadow-xs backdrop-blur-sm pl-9 transition-all focus:border-indigo-400 focus:bg-white"
            />
          </form>

          <Link
            href="/notifications"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative hover:bg-white/80"
            )}
          >
            <Bell className="h-5 w-5" />
            {NOTIFICATIONS.some((n) => !n.read) && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </Link>

          <Link
            href="/profile"
            className={buttonVariants({ variant: "ghost", size: "icon", className: "hover:bg-white/80" })}
          >
            <Avatar className="h-8 w-8 ring-2 ring-indigo-200/60">
              <AvatarFallback className="bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
