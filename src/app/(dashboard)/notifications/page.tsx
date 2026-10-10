"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FadeIn } from "@/components/shared/ui-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NOTIFICATIONS } from "@/lib/mock-data";
import {
  getUserNotifications,
  markNotificationAsRead as syncReadToFirestore,
  markAllNotificationsAsRead as syncAllReadToFirestore,
} from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/lib/types";

const TYPE_LABELS: Record<NotificationItem["type"], string> = {
  deadline: "Deadline",
  match: "Match",
  profile: "Profile",
  system: "System",
};

export default function NotificationsPage() {
  const { user, isDemo } = useAuth();
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(NOTIFICATIONS);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const uid = user?.uid || (isDemo ? "demo-user-001" : "");
    if (!uid) return;
    getUserNotifications(uid, isDemo).then(setNotifications).catch(() => {});
  }, [user, isDemo]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const uid = user?.uid || (isDemo ? "demo-user-001" : "");
    if (uid) {
      await syncReadToFirestore(uid, id, isDemo);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const uid = user?.uid || (isDemo ? "demo-user-001" : "");
    if (uid) {
      await syncAllReadToFirestore(uid, isDemo);
      toast.success("All notifications marked as read");
    }
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <PageHeader
          title="Notifications"
          description="Stay on top of deadlines, matches, and application updates."
          action={
            unreadCount > 0 ? (
              <Button variant="outline" className="gap-2" onClick={markAllRead}>
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            ) : undefined
          }
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Tabs value={filter} onValueChange={(v) => v && setFilter(String(v))}>
          <TabsList>
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </FadeIn>

      <div className="space-y-2">
        {filtered.map((n, i) => {
          const content = (
            <div
              className={cn(
                "flex gap-4 rounded-2xl border px-4 py-4 transition-colors",
                !n.read
                  ? "border-primary/20 bg-primary/[0.02]"
                  : "border-border bg-card"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {TYPE_LABELS[n.type]}
                  </Badge>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {format(parseISO(n.createdAt), "d MMM yyyy, h:mm a")}
                </p>
              </div>
              {!n.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    markAsRead(n.id);
                  }}
                >
                  Mark read
                </Button>
              )}
            </div>
          );

          return (
            <FadeIn key={n.id} delay={0.03 * i}>
              {n.href ? (
                <Link
                  href={n.href}
                  onClick={() => markAsRead(n.id)}
                  className="block hover:opacity-90"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </FadeIn>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "unread"
              ? "You're all caught up — no unread notifications."
              : "No notifications yet."}
          </p>
        </div>
      )}
    </div>
  );
}
