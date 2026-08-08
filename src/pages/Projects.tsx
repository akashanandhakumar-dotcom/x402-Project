import { AppShell } from "@/components/app-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ArrowRight, FileText, FolderKanban, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Projects() {
  const projects = useQuery(api.decks.listProjects);
  const decks = useQuery(api.decks.listDecks);
  const deleteProject = useMutation(api.decks.deleteProject);

  const countFor = (projectId: string) =>
    decks?.filter((d) => d.projectId === projectId).length ?? 0;
  const latestDeckFor = (projectId: string) =>
    decks?.find((d) => d.projectId === projectId);

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
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Library
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-100">Projects</h1>
            <p className="mt-2 text-[14px] text-slate-400">
              Every source README or doc set you’ve forged into a deck, grouped
              by project.
            </p>
          </div>
          <Link to="/dashboard">
            <Button className="shimmer gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_10px_24px_rgba(34,211,238,0.25)]">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              New project
            </Button>
          </Link>
        </header>

        {projects === undefined ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl bg-white/60" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-soft mt-8 flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center">
            <span className="glass-soft grid h-14 w-14 place-items-center rounded-2xl text-slate-300">
              <FolderKanban className="h-6 w-6" />
            </span>
            <p className="max-w-sm text-[14px] leading-relaxed text-slate-400">
              No projects yet. Forge your first deck on the dashboard and it
              will appear here.
            </p>
            <Link to="/dashboard">
              <Button className="mt-2 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
                <Plus className="h-4 w-4" />
                Create a deck
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => {
              const count = countFor(project._id);
              const latest = latestDeckFor(project._id);
              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="glass glass-hover group relative flex flex-col overflow-hidden rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="glass-soft grid h-10 w-10 place-items-center rounded-xl text-emerald-300">
                      <FileText className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          aria-label="Delete project"
                          className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-strong rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete “{project.name}”?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This deletes the project and all {count} deck{count === 1 ? "" : "s"} it contains.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="glass-soft rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-xl bg-rose-500 text-white hover:bg-rose-600"
                            onClick={async () => {
                              try {
                                await deleteProject({ projectId: project._id });
                                toast.success("Project deleted");
                              } catch {
                                toast.error("Could not delete project");
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <h3 className="mt-4 line-clamp-1 text-[16px] font-bold text-slate-100">
                    {project.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-slate-500">
                    {project.sourceMarkdown.replace(/[#*`>_-]/g, "").trim().slice(0, 170) || "No preview available"}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
                    <span className="text-[11.5px] font-medium text-slate-500">
                      {count} deck{count === 1 ? "" : "s"} ·{" "}
                      {formatDistanceToNow(new Date(project._creationTime), { addSuffix: true })}
                    </span>
                    {latest ? (
                      <Link
                        to={`/deck/${latest._id}`}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_8px_18px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5"
                      >
                        Open deck <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-[11.5px] text-slate-600">no decks</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
