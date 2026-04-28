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
