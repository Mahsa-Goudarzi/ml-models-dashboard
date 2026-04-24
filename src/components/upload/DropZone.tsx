"use client";

// react
import { useCallback, useState } from "react";

// next
import { useRouter } from "next/navigation";

// dataset store
import { useDatasetStore } from "@/core/store/datasetStore";

// csv parser
import { parseCSV } from "@/core/data/parser";

// icons
import { Upload, AlertCircle } from "lucide-react";

// animation
import { motion, AnimatePresence } from "framer-motion";

// utils
import { cn } from "@/utils/utils";

const SAMPLE_DATASETS = [
  {
    name: "Iris",
    meta: "150 rows · 5 cols",
    tag: "classification",
    file: "iris",
    tagClass: "text-[var(--purple-primary)] bg-[var(--purple-secondary)]",
  },
  {
    name: "Titanic",
    meta: "891 rows · 12 cols",
    tag: "binary",
    file: "titanic",
    tagClass: "text-[var(--green-primary)] bg-[var(--green-secondary)]",
  },
  {
    name: "House Prices",
    meta: "1460 rows · 79 cols",
    tag: "regression",
    file: "houses",
    tagClass: "text-[var(--blue-primary)] bg-[var(--blue-secondary)]",
  },
];

const maxFileSize: number = 5 * 1024 * 1024; // 5MB file size limit

export default function DropZone() {
  // states
  const [dragging, setDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // state management: set dataset
  const setDataset = useDatasetStore((s) => s.setDataset);

  // router
  const router = useRouter();

  const handleFile = useCallback(
    async (file: File) => {
      setLoading(true);

      if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
        setError("Only CSV files are supported for now.");
        setLoading(false);
        return;
      }

      if (file.size > maxFileSize) {
        const currentFileSize = (file.size / (1024 * 1024)).toFixed(2);
        setError(
          `File is ${currentFileSize}MB. Max allowed file size is ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB.`,
        );
        setLoading(false);
        return;
      }

      setError(null);
      try {
        const dataset = await parseCSV(file);
        setDataset(dataset);
        router.push("/dashboard");
      } catch (e: Error | unknown) {
        setError("Failed to parse file. Please make sure it's a valid CSV.");
      } finally {
        setLoading(false);
      }
    },
    [setDataset, router],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      {/* Drop zone */}
      <motion.div
        className={cn(
          "w-full border-[1.5px] border-dashed rounded-xl p-10 flex flex-col items-center gap-3 transition-colors",
          dragging
            ? "border-[var(--purple-primary)] bg-[var(--purple-secondary)] scale-101"
            : "border-[#7F77DD] bg-[var(--purple-secondary)]/60",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="w-12 h-12 bg-[var(--purple-primary)] rounded-xl flex items-center justify-center">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={22} color="white" />
          )}
        </div>
        <div className="text-[15px] font-medium text-[#26215C]">
          {loading ? "parsing your dataset…" : "drop your dataset here"}
        </div>
        <div className="text-[12px] text-[var(--purple-primary)] text-center">
          supports CSV · up to 50MB
          <br />
          auto-detects column types and target variable
        </div>
        <label className="mt-1 px-5 py-2 bg-[var(--purple-primary)] hover:bg-[#3C3489] text-white text-[12px] font-medium rounded-md cursor-pointer transition-colors">
          browse files
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
        </label>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-[12px] text-[var(--color-text-danger)] bg-[var(--color-background-danger)] px-3 py-2 rounded-md w-full"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Or separator */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <div className="text-[11px] text-[var(--text-tertiary)]">
          or try a sample dataset
        </div>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Sample datasets */}
      <div className="flex gap-2 w-full">
        {SAMPLE_DATASETS.map((ds) => (
          <button
            key={ds.name}
            onClick={() => {
              // later we will fetch the sample CSV from /public/samples/
              alert(`Sample ${ds.name} will be added in the next release`);
            }}
            className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-2.5 text-left hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
          >
            <div className="text-[12px] font-medium text-[var(--text-primary)]">
              {ds.name}
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
              {ds.meta}
            </div>
            <span
              className={cn(
                "inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                ds.tagClass,
              )}
            >
              {ds.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
