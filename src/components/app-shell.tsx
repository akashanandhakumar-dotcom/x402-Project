import { BackgroundFX } from "@/components/background";
import { Brand } from "@/components/brand";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Plus,
  Presentation,
  Settings,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [open, setOpen] = useState(false);

  const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/decks", label: "Decks", icon: Presentation },
    { to: "/templates", label: "Templates", icon: LayoutTemplate },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/settings", label: "Settings", icon: Settings },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  const renderNav = (onNavigate?: () => void) => (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          title={item.label}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white shadow-[0_8px_20px_rgba(0,168,107,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"
                : "text-sidebar-foreground/65 hover:bg-white/5 hover:text-foreground",
            )
          }
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="relative min-h-screen">
      <BackgroundFX particleCount={38} />

      {/* Desktop floating sidebar */}
      <aside className="glass-strong no-print fixed bottom-4 left-4 top-4 z-30 hidden w-64 flex-col rounded-2xl lg:flex">
        <Link to="/dashboard" className="px-5 pt-5">
          <Brand />
        </Link>
        <div className="px-5 pb-3 pt-5">
          <Link to="/dashboard">
            <Button className="shimmer w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_10px_24px_rgba(0,168,107,0.35)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,168,107,0.45)]">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              New deck
            </Button>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto pb-2">{renderNav()}</div>
        <div className="px-3 pb-3">
          <UserChip isAdmin={isAdmin} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
        <Link to="/dashboard">
          <Brand />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="glass-soft h-10 w-10 rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 rounded-r-2xl border-r border-white/10 bg-[oklch(0.17_0.04_160/0.95)] p-0 backdrop-blur-2xl">
            <SheetHeader className="border-b border-white/10 px-5 py-4 text-left">
              <SheetTitle asChild>
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Brand />
                </Link>
              </SheetTitle>
              <SheetDescription className="sr-only">Navigation</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4 py-4">
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  New deck
                </Button>
              </Link>
              {renderNav(() => setOpen(false))}
              <div className="mt-2">
                <UserChip isAdmin={isAdmin} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="px-4 pb-14 pt-4 sm:px-6 lg:pl-[19.5rem] lg:pr-8 lg:pt-6">{children}</main>
    </div>
  );
}

function UserChip({ isAdmin }: { isAdmin: boolean }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isPro = user?.plan === "pro";
  const initials =
    user?.name
      ?.split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PF";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch {
      /* noop */
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-left backdrop-blur-md transition hover:bg-white/10"
        >
          <Avatar className="h-8 w-8">
            {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-[11px] font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-foreground">
              {user?.name || "Guest"}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {user?.email || "anonymous workspace"}
            </span>
          </span>
          {(isPro || isAdmin) && (
            <Badge
              className={cn(
                "border-transparent px-1.5 py-0 text-[9.5px] font-bold uppercase tracking-wide",
                isPro ? "bg-emerald-500/15 text-emerald-300" : "bg-teal-500/15 text-teal-300",
              )}
            >
              {isPro ? "Pro" : "Admin"}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Signed in as {user?.email || "guest"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/wallet" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            Billing & plan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
