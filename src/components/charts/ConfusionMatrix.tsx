"use client";

// react
import { useMemo } from "react";

// types
import { ConfusionMatrixPropsType } from "@/types/types";

const COLORS = {
  high: { bg: "#26215C", text: "#CECBF6" },
  mid: { bg: "#534AB7", text: "#EEEDFE" },
  low: { bg: "#EEEDFE", text: "#534AB7" },
  zero: { bg: "#F1EFE8", text: "#888780" },
};

export default function ConfusionMatrix({
  matrix,
  classNames,
}: ConfusionMatrixPropsType) {
  const max = useMemo(
    () => Math.max(...matrix.flatMap((row) => row)),
    [matrix],
  );

  const getStyle = (val: number, isCorrect: boolean) => {
    if (val === 0) return COLORS.zero;
    const ratio = val / max;
    if (isCorrect) return ratio > 0.7 ? COLORS.high : COLORS.mid;
    return { bg: "#FAECE7", text: "#712B13" };
  };

  return (
    <div className="w-full overflow-auto">
      <div className="text-[10px] text-[var(--text-tertiary)] mb-2">
        predicted →
      </div>
      <table className="border-separate" style={{ borderSpacing: 3 }}>
        <thead>
          <tr>
            <th className="w-16" />
            {classNames.map((c) => (
              <th
                key={c}
                className="text-[10px] font-medium text-[var(--text-secondary)] text-center pb-1 min-w-[52px]"
              >
                {c.length > 8 ? c.slice(0, 7) + "…" : c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, ri) => (
            <tr key={ri}>
              <td className="text-[10px] text-[var(--text-secondary)] text-right pr-2 font-medium">
                {classNames[ri].length > 8
                  ? classNames[ri].slice(0, 7) + "…"
                  : classNames[ri]}
              </td>
              {row.map((val, ci) => {
                const style = getStyle(val, ri === ci);
                const pct =
                  max > 0
                    ? Math.round((val / row.reduce((a, b) => a + b, 0)) * 100)
                    : 0;
                return (
                  <td
                    key={ci}
                    className="rounded-md text-center p-2 min-w-[52px] min-h-[44px] transition-opacity hover:opacity-80 cursor-default"
                    style={{ background: style.bg }}
                    title={`${classNames[ri]} → ${classNames[ci]}: ${val} (${pct}%)`}
                  >
                    <div
                      className="text-[15px] font-medium"
                      style={{ color: style.text }}
                    >
                      {val}
                    </div>
                    {val > 0 && (
                      <div
                        className="text-[9px]"
                        style={{ color: style.text, opacity: 0.75 }}
                      >
                        {pct}%
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
