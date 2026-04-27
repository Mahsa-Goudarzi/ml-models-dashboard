"use client";

// animations
import { motion } from "framer-motion";

// types
import { FeatureImportancePropsType } from "@/types/types";

const BAR_COLORS = ["#534AB7", "#7F77DD", "#AFA9EC", "#CECBF6"];

export default function FeatureImportance({
  data,
}: FeatureImportancePropsType) {
  const max = Math.max(...data.map((d) => d.importance), 1);
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {data.map((item, i) => (
        <div key={item.feature} className="flex items-center gap-2.5">
          <div className="text-[11px] text-[var(--text-secondary)] w-[90px] text-right shrink-0 truncate">
            {item.feature}
          </div>
          <div className="flex-1 h-4 bg-[var(--bg-secondary)] rounded overflow-hidden">
            <motion.div
              className="h-full rounded"
              style={{
                background: BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)],
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.importance / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
            >
              <span className="text-[10px] font-medium text-white px-1.5 leading-4 block">
                {item.importance.toFixed(1)}%
              </span>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}
