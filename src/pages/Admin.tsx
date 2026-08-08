import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { MessageSquare, Presentation, ShieldCheck, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Tab = "users" | "decks" | "comments";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Users", icon: Users },
  { id: "decks", label: "Decks", icon: Presentation },
  { id: "comments", label: "Comments", icon: MessageSquare },
];

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("users");

  if (user?.role !== "admin") {
    return (
      <AppShell>
        <div className="glass-soft mx-auto mt-16 flex max-w-md flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
          <ShieldCheck className="h-10 w-10 text-slate-600" />
          <h1 className="text-xl font-bold text-slate-100">Admins only</h1>
          <p className="text-[13.5px] leading-relaxed text-slate-400">
            This area is restricted to workspace administrators. If you manage
            the forge, ask an admin to grant you the role.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl"
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-teal-300">
              Console
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-100">Admin</h1>
            <p className="mt-2 text-[14px] text-slate-400">
              Manage users, moderate decks, and keep the catalog clean.
            </p>
          </div>
          <Badge className="w-fit border-transparent bg-teal-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-300">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Administrator
          </Badge>
        </header>

        <div className="glass-soft mt-6 flex w-fit gap-1 rounded-2xl p-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-200",
                tab === t.id
                  ? "bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white shadow-[0_8px_20px_rgba(34,211,238,0.2)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "users" && <UsersTab />}
          {tab === "decks" && <DecksTab />}
          {tab === "comments" && <CommentsTab />}
        </div>
      </motion.div>
    </AppShell>
  );
}

function RowShell({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

function UsersTab() {
  const users = useQuery(api.admin.adminListUsers);
  const setUser = useMutation(api.admin.adminSetUser);

  if (users === undefined) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <RowShell>
      {users.length === 0 && <p className="text-center text-[13.5px] text-slate-500">No users yet.</p>}
      {users.map((u) => (
        <div key={u._id} className="glass flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[12px] font-bold text-white">
            {(u.name || u.email || "U")
              .split(/\s+/)
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-slate-100">{u.name || "Anonymous"}</p>
            <p className="truncate text-[12px] text-slate-500">{u.email || "no email"}</p>
          </div>
          <Badge className={cn("border-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            u.role === "admin" ? "bg-teal-500/15 text-teal-300" : "bg-white/5 text-slate-400")}>
            {u.role ?? "user"}
          </Badge>
          <Badge className={cn("border-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            (u.plan ?? "free") === "pro" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-slate-500")}>
            {(u.plan ?? "free") === "pro" ? "Pro" : "Free"}
          </Badge>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="glass-soft rounded-lg text-[12px] text-slate-300 hover:bg-white/10"
              onClick={async () => {
                try {
                  await setUser({
                    userId: u._id,
                    role: u.role === "admin" ? "user" : "admin",
                    plan: (u.plan ?? "free") as "free" | "pro",
                  });
                  toast.success(u.role === "admin" ? "Role set to user" : "Promoted to admin");
                } catch {
                  toast.error("Could not update role");
                }
              }}
            >
              {u.role === "admin" ? "Demote" : "Make admin"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="glass-soft rounded-lg text-[12px] text-slate-300 hover:bg-white/10"
              onClick={async () => {
                try {
                  await setUser({
                    userId: u._id,
                    role: (u.role ?? "user") as "admin" | "user" | "member",
                    plan: (u.plan ?? "free") === "pro" ? "free" : "pro",
                  });
                  toast.success((u.plan ?? "free") === "pro" ? "Plan set to Free" : "Granted Pro plan");
                } catch {
                  toast.error("Could not update plan");
                }
              }}
            >
              {(u.plan ?? "free") === "pro" ? "Revoke Pro" : "Grant Pro"}
            </Button>
          </div>
        </div>
      ))}
    </RowShell>
  );
}

function DecksTab() {
  const decks = useQuery(api.admin.adminListDecks);
  const deleteDeck = useMutation(api.admin.adminDeleteDeck);
  const publishDeck = useMutation(api.decks.publishDeck);

  if (decks === undefined) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <RowShell>
      {decks.length === 0 && <p className="text-center text-[13.5px] text-slate-500">No decks yet.</p>}
      {decks.map((d) => (
        <div key={d._id} className="glass flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3.5">
          <span className="glass-soft grid h-9 w-9 shrink-0 place-items-center rounded-xl text-teal-300">
            <Presentation className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-slate-100">{d.title}</p>
            <p className="truncate text-[12px] text-slate-500">
              owner {d.ownerId} · {d.sections.length + 2} slides · {d.shareCode}
            </p>
          </div>
          <Badge className={cn("border-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            d.published ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-slate-500")}>
            {d.published ? "Published" : "Draft"}
          </Badge>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="glass-soft rounded-lg text-[12px] text-slate-300 hover:bg-white/10"
              onClick={async () => {
                try {
                  await publishDeck({ deckId: d._id, published: !d.published });
                  toast.success(d.published ? "Unpublished from catalog" : "Published to catalog");
                } catch {
                  toast.error("Could not update catalog status");
                }
              }}
            >
              {d.published ? "Unpublish" : "Publish"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="glass-soft rounded-lg text-[12px] text-rose-300 hover:bg-rose-500/10"
              onClick={async () => {
                try {
                  await deleteDeck({ deckId: d._id });
                  toast.success("Deck deleted");
                } catch {
                  toast.error("Could not delete deck");
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </RowShell>
  );
}

function CommentsTab() {
  const comments = useQuery(api.admin.adminListComments);
  const deleteComment = useMutation(api.admin.adminDeleteComment);

  if (comments === undefined) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <RowShell>
      {comments.length === 0 && <p className="text-center text-[13.5px] text-slate-500">No comments yet.</p>}
      {comments.map((c) => (
        <div key={c._id} className="glass flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3.5">
          <span className="glass-soft grid h-9 w-9 shrink-0 place-items-center rounded-xl text-emerald-300">
            <MessageSquare className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] text-slate-200">
              <span className="font-semibold text-slate-100">{c.authorName}</span> — {c.body}
            </p>
            <p className="truncate text-[12px] text-slate-500">
              deck {c.deckId} ·{" "}
              {new Date(c._creationTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="glass-soft rounded-lg text-[12px] text-rose-300 hover:bg-rose-500/10"
            onClick={async () => {
              try {
                await deleteComment({ commentId: c._id });
                toast.success("Comment deleted");
              } catch {
                toast.error("Could not delete comment");
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      ))}
    </RowShell>
  );
}
