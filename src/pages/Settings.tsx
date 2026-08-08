import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import type { WalletKind } from "@/lib/algorand";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  CreditCard,
  ExternalLink,
  KeyRound,
  Link2,
  Loader2,
  LogOut,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
  User,
  Wallet as WalletIcon,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

function SettingsSection({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof User;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass overflow-hidden rounded-3xl"
    >
      <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
        <span className="glass-soft grid h-9 w-9 place-items-center rounded-xl text-emerald-300">
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold text-slate-100">{title}</h2>
          <p className="text-[12px] text-slate-500">{desc}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </motion.section>
  );
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const settings = useQuery(api.settings.getSettings);
  const x402Config = useQuery(api.payments.getX402Config);
  const billing = useQuery(api.billing.getBilling);
  const updateProfile = useMutation(api.settings.updateProfile);
  const saveWalletAddress = useMutation(api.settings.saveWalletAddress);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [bio, setBio] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingWallet, setSavingWallet] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Hydrate local state once the reactive query lands.
  const hydrated = settings !== undefined;
  const currentName = settings?.name ?? user?.name ?? "";
  const currentImage = settings?.image ?? "";
  const currentBio = settings?.bio ?? "";
  const currentWallet = settings?.walletAddress ?? "";

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({ name: name || undefined, image: image || undefined, bio: bio || undefined });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveWallet = async () => {
    setSavingWallet(true);
    try {
      await saveWalletAddress({ walletAddress });
      toast.success("Wallet address saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save wallet");
    } finally {
      setSavingWallet(false);
    }
  };

  const handleConnectWallet = async (kind: Exclude<WalletKind, "manual">) => {
    setSavingWallet(true);
    try {
      let address = "";
      if (kind === "pera") {
        const { connectPera } = await import("@/lib/algorand");
        address = await connectPera();
      } else {
        const { connectDefly } = await import("@/lib/algorand");
        address = await connectDefly();
      }
      await saveWalletAddress({ walletAddress: address });
      setWalletAddress(address);
      toast.success(`${kind === "pera" ? "Pera" : "Defly"} wallet connected`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not connect the wallet");
    } finally {
      setSavingWallet(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out");
    } catch {
      toast.error("Could not sign out");
    } finally {
      setSigningOut(false);
    }
  };

  const isPro = billing?.plan === "pro" || settings?.plan === "pro";
  const initials =
    (currentName || user?.name || "PF")
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PF";

  const field =
    "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-[13px] text-white/85 shadow-inner backdrop-blur-md placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20";

  if (!hydrated) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-44 rounded-3xl bg-white/5" />
          <Skeleton className="h-52 rounded-3xl bg-white/5" />
          <Skeleton className="h-40 rounded-3xl bg-white/5" />
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
        className="mx-auto max-w-4xl"
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Account
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Settings</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-white/50">
              Manage your profile, Algorand wallet, and account preferences.
            </p>
          </div>
          {isPro ? (
            <Badge className="w-fit border-transparent bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
              Founder plan
            </Badge>
          ) : (
            <Badge className="w-fit border-transparent bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white/50">
              Free plan
            </Badge>
          )}
        </header>

        <div className="mt-8 space-y-6">
          {/* Profile */}
          <SettingsSection icon={User} title="Profile" desc="How you appear to founders and investors">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex flex-col items-center gap-3 sm:w-40">
                <Avatar className="h-24 w-24 rounded-3xl">
                  <AvatarImage src={currentImage || undefined} alt={currentName} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-[13.5px] font-semibold text-white">{currentName || "Unnamed founder"}</p>
                  <p className="text-[11.5px] text-white/40">{settings?.email || "No email"}</p>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                    Display name
                  </label>
                  <input
                    className={field}
                    value={name || currentName}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                    Avatar URL
                  </label>
                  <input
                    className={field}
                    value={image || currentImage}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://… (optional)"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                    Bio
                  </label>
                  <textarea
                    className="h-20 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white/85 shadow-inner backdrop-blur-md placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                    value={bio || currentBio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="One line about you and your project…"
                    maxLength={240}
                  />
                  <p className="mt-1 text-right text-[10.5px] text-white/30">{(bio || currentBio).length}/240</p>
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_10px_24px_rgba(0,168,107,0.25)]"
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save profile
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* Algorand wallet */}
          <SettingsSection icon={WalletIcon} title="Algorand wallet" desc="Used to sign mints and crypto payments">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                  Wallet address
                </label>
                <input
                  className={cn(field, "font-mono")}
                  value={walletAddress || currentWallet}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="ALGO address (58-char base32)"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleConnectWallet("pera")}
                  disabled={savingWallet}
                  className="gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                >
                  {savingWallet ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <WalletIcon className="h-3.5 w-3.5" />}
                  Connect Pera
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleConnectWallet("defly")}
                  disabled={savingWallet}
                  className="gap-1.5 rounded-lg border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
                >
                  {savingWallet ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-emerald-300" />}
                  Connect Defly
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveWallet}
                  disabled={savingWallet || !walletAddress.trim()}
                  variant="outline"
                  className="gap-1.5 rounded-lg glass-soft text-white/70 hover:bg-white/10"
                >
                  {savingWallet ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save address
                </Button>
              </div>
              {currentWallet && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3">
                  <span className="truncate font-mono text-[11.5px] text-emerald-300">{currentWallet}</span>
                  <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wider text-emerald-300/70">
                    Saved ✓
                  </span>
                </div>
              )}
              {x402Config && (
                <p className="text-[11.5px] leading-relaxed text-white/35">
                  Network: <span className="font-semibold text-emerald-300">{x402Config.network}</span> · Payments
                  settle to{" "}
                  <span className="font-mono">{x402Config.receiverAddress.slice(0, 10)}…</span> via crypto on the
                  Algorand network.
                </p>
              )}
            </div>
          </SettingsSection>

          {/* Plan & billing */}
          <SettingsSection icon={CreditCard} title="Plan & billing" desc="Your PitchForge plan and usage">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[15px] font-semibold text-white">
                  {isPro ? "Founder plan — unlimited decks" : "Free plan"}
                </p>
                <p className="mt-1 text-[12.5px] text-white/45">
                  {isPro
                    ? "Unlimited pitch decks, catalog publishing, priority quality."
                    : `${billing?.deckCount ?? 0} of 2 decks forged — upgrade for unlimited.`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isPro && (
                  <Link to="/wallet">
                    <Button className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_10px_24px_rgba(0,168,107,0.25)]">
                      <CreditCard className="h-4 w-4" />
                      Upgrade
                    </Button>
                  </Link>
                )}
                <Link to="/wallet">
                  <Button variant="outline" className="gap-2 rounded-xl glass-soft text-white/70 hover:bg-white/10">
                    <WalletIcon className="h-4 w-4" />
                    Manage in Wallet
                  </Button>
                </Link>
              </div>
            </div>
          </SettingsSection>

          {/* Integrations */}
          <SettingsSection icon={KeyRound} title="Integrations & keys" desc="Network connectivity for blockchain features">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
                    <Link2 className="h-3.5 w-3.5 text-emerald-300" /> Algorand crypto
                  </span>
                  <Badge className="border-transparent bg-emerald-500/10 text-emerald-300">Configured</Badge>
                </div>
                <p className="mt-1.5 text-[11.5px] text-white/40">
                  {x402Config
                    ? `Public ${x402Config.network} node via AlgoNode — receiver ${x402Config.receiverAddress.slice(0, 8)}…`
                    : "Loading network config…"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
                    <WalletIcon className="h-3.5 w-3.5 text-emerald-300" /> Crypto payments
                  </span>
                  <Badge className="border-transparent bg-amber-500/10 text-amber-300">Needs key</Badge>
                </div>
                <p className="mt-1.5 text-[11.5px] text-white/40">
                  Payments are processed via Algorand blockchain. Connect your wallet to pay.
                </p>
              </div>
              {settings?.role === "admin" && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Admin access
                    </span>
                    <Link to="/admin">
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-lg glass-soft text-white/70 hover:bg-white/10">
                        Open admin <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </SettingsSection>

          {/* Danger zone */}
          <SettingsSection icon={SettingsIcon} title="Account" desc="Sign out or manage your session">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12.5px] text-white/45">
                You're signed in as <span className="font-semibold text-white/80">{settings?.email || currentName}</span>
                {settings?.isAnonymous ? " (guest session)" : ""}.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  variant="outline"
                  className="gap-2 rounded-xl border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                >
                  {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  Sign out
                </Button>
                <Button variant="outline" disabled className="gap-2 rounded-xl glass-soft text-white/30">
                  <Trash2 className="h-4 w-4" />
                  Delete account
                </Button>
              </div>
            </div>
          </SettingsSection>
        </div>
      </motion.div>
    </AppShell>
  );
}
