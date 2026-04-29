"use client";

// next
import Link from "next/link";
import { usePathname } from "next/navigation";

// store
import { useDatasetStore } from "@/core/store/datasetStore";
import { useTrainingStore } from "@/core/store/trainingStore";

// utils
import { cn } from "@/utils/utils";

// icons
import {
  LayoutDashboard,
  Table2,
  BarChart3,
  BrainCircuit,
  TrendingUp,
  Upload,
} from "lucide-react";

// constants
import { TRAINING_STATUS } from "@/const/const";

// constant nav items
const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "workspace",
  },
  { label: "Dataset", href: "/dataset", icon: Table2, section: "workspace" },
  { label: "EDA", href: "/eda", icon: BarChart3, section: "workspace" },
  { label: "Train", href: "/train", icon: BrainCircuit, section: "workspace" },
  {
    label: "Results",
    href: "/results",
    icon: TrendingUp,
    section: "workspace",
  },
];

export default function Sidebar() {
  // use path name to determine active nav item
  const pathname = usePathname();

  // dataset global state
  const dataset = useDatasetStore((s) => s.dataset);

  // training status
  const status = useTrainingStore((s) => s.status);

  // constants
  const workspaceItems = navItems.filter((i) => i.section === "workspace");

  return (
    <aside className="w-[180px] bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-[var(--border)]">
        <div className="text-[15px] font-medium text-[var(--text-primary)] tracking-tight">
          ML<span className="text-[#7F77DD]">ens</span>
        </div>
        <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
          visual ml studio
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2.5 overflow-y-auto">
        <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.8px] px-2 pb-1.5 pt-1">
          workspace
        </div>
        {workspaceItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const locked = !dataset && item.href !== "/dashboard";
          return (
            <Link
              key={item.href}
              href={locked ? "/" : item.href}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] mb-0.5 transition-colors",
                active
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]",
                locked && "opacity-40 cursor-not-allowed",
              )}
            >
              <Icon size={13} />
              {item.label}
              {item.label === "Train" &&
                status === TRAINING_STATUS.Training && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
                )}
              {item.label === "Dataset" && dataset && (
                <span className="ml-auto text-[9px] bg-[var(--purple-secondary)] text-[var(--purple-primary)] px-1.5 py-0.5 rounded-full font-medium">
                  CSV
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Social media links */}
      <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-2">
        <a
          href="https://www.linkedin.com/in/mahsagoudarzi/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-7 h-7 rounded-md text-[var(--text-tertiary)] hover:text-[#534AB7] hover:bg-[#EEEDFE] transition-colors"
          title="LinkedIn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        <a
          href="https://github.com/Mahsa-Goudarzi/ml-models-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-7 h-7 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
          title="GitHub"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
        <div className="ml-auto text-[9px] text-[var(--text-tertiary)]">
          built with ♥
        </div>
      </div>

      {/* Upload button */}
      <div className="p-2">
        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 w-full py-2 bg-[var(--purple-primary)] hover:bg-[#3C3489] text-white text-[11px] font-medium rounded-md transition-colors"
        >
          <Upload size={12} />
          upload dataset
        </Link>
      </div>
    </aside>
  );
}
