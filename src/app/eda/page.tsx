"use client";

// react
import { useEffect, useMemo, useState } from "react";

// next
import { useRouter } from "next/navigation";

// components
import AppShell from "@/components/ui/AppShell";
import CorrelationHeatmap from "@/components/charts/CorrelationHeatmap";
import ScatterPlot from "@/components/charts/ScatterPlot";
import Panel from "@/components/ui/Panel";

//store
import { useDatasetStore } from "@/core/store/datasetStore";
//stats
import {
  computeCorrelationMatrix,
  computeClassBalance,
  getScatterData,
} from "@/core/data/stats";

// utils
import { getNumericFeatures } from "@/utils/utils";

// constants
import { TASKS } from "@/const/const";

export default function EDAPage() {
  // router
  const router = useRouter();

  // app scope states
  const dataset = useDatasetStore((s) => s.dataset);
  const isClassification = dataset?.taskType === TASKS.Classification;

  const { labels, matrix } = useMemo(
    () =>
      dataset ? computeCorrelationMatrix(dataset) : { labels: [], matrix: [] },
    [dataset],
  );

  const balance = useMemo(
    () => (dataset && isClassification ? computeClassBalance(dataset) : {}),
    [dataset, isClassification],
  );

  const numericCols = useMemo(
    () => getNumericFeatures(dataset) ?? [],
    [dataset],
  );

  // states
  const [xCol, setXCol] = useState(
    numericCols[2]?.name ?? numericCols[0]?.name ?? "",
  );
  const [yCol, setYCol] = useState(
    numericCols[3]?.name ?? numericCols[1]?.name ?? "",
  );

  const scatterData = useMemo(
    () =>
      xCol && yCol && dataset
        ? getScatterData(
            dataset,
            xCol,
            yCol,
            dataset.targetColumn ?? undefined,
            isClassification,
          )
        : [],
    [dataset, xCol, yCol],
  );

  const max = useMemo(() => Math.max(...Object.values(balance), 1), [balance]);

  useEffect(() => {
    if (!dataset) router.replace("/");
  }, [dataset, router]);

  if (!dataset) return null;

  return (
    <AppShell>
      <div className="h-11 border-b border-[var(--border)] flex items-center px-4 gap-2 shrink-0">
        {["correlation", "distributions", "scatter", "outliers"].map((tab) => (
          <button
            key={tab}
            className="text-[12px] text-[var(--text-secondary)] px-2.5 py-1 rounded first:bg-[var(--bg-secondary)] first:text-[var(--text-primary)] first:font-medium"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-[var(--border)] overflow-hidden">
        <Panel title="correlation heatmap">
          {labels.length > 1 ? (
            <CorrelationHeatmap labels={labels} matrix={matrix} />
          ) : (
            <div className="text-[11px] text-[var(--text-tertiary)] m-auto">
              need 2+ numeric columns
            </div>
          )}
        </Panel>

        <Panel
          title={`feature distributions${isClassification ? " + class balance" : ""}`}
        >
          <div className="flex flex-col gap-2 flex-1">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.5px]">
              mean values
            </div>
            {numericCols.map((col) => (
              <div
                key={col.name}
                className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]"
              >
                <span className="w-24 text-right shrink-0">{col.name}</span>
                <div className="flex-1 h-3.5 bg-[var(--bg-secondary)] rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${(((col.mean ?? 0) - (col.min ?? 0)) / ((col.max ?? 1) - (col.min ?? 0))) * 100}%`,
                      background: "#7F77DD",
                      opacity: 0.8,
                    }}
                    title={`mean position: ${col.mean?.toFixed(2)} (between min. ${col.min?.toFixed(2)} - max. ${col.max?.toFixed(2)})`}
                  />
                </div>
                <span className="w-14 text-[var(--text-tertiary)]">
                  μ={col.mean?.toFixed(2)}
                </span>
              </div>
            ))}

            {Object.keys(balance).length > 0 && (
              <>
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.5px] mt-2">
                  class balance
                </div>
                {Object.entries(balance).map(([cls, count], i) => (
                  <div
                    key={cls}
                    className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]"
                  >
                    <span className="w-24 text-right shrink-0">{cls}</span>
                    <div className="flex-1 h-3.5 bg-[var(--bg-secondary)] rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(count / max) * 100}%`,
                          background: ["#534AB7", "#1D9E75", "#D85A30"][i % 3],
                        }}
                      />
                    </div>
                    <span className="w-6 text-[var(--text-tertiary)]">
                      {count}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </Panel>

        <Panel title="scatter plot">
          <div className="flex gap-2 shrink-0">
            <select
              value={xCol}
              onChange={(e) => setXCol(e.target.value)}
              className="flex-1 text-[11px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1"
            >
              {numericCols.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="text-[var(--text-tertiary)] self-center text-[11px]">
              vs
            </span>
            <select
              value={yCol}
              onChange={(e) => setYCol(e.target.value)}
              className="flex-1 text-[11px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1"
            >
              {numericCols.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <ScatterPlot data={scatterData} xLabel={xCol} yLabel={yCol} />
          </div>
        </Panel>

        <Panel title="column stats">
          <div className="overflow-y-auto flex-1">
            <table
              className="w-full text-[11px]"
              style={{ tableLayout: "fixed" }}
            >
              <thead>
                <tr className="text-[10px] text-[var(--text-tertiary)] uppercase">
                  <th className="text-left py-1 font-medium">column</th>
                  <th className="text-right py-1 font-medium">mean</th>
                  <th className="text-right py-1 font-medium">std</th>
                  <th className="text-right py-1 font-medium">nulls</th>
                </tr>
              </thead>
              <tbody>
                {numericCols.map((col) => (
                  <tr
                    key={col.name}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="py-1.5 text-[var(--text-primary)] truncate">
                      {col.name}
                    </td>
                    <td className="py-1.5 text-right font-mono text-[var(--text-secondary)]">
                      {col.mean?.toFixed(3)}
                    </td>
                    <td className="py-1.5 text-right font-mono text-[var(--text-secondary)]">
                      {col.std?.toFixed(3)}
                    </td>
                    <td
                      className="py-1.5 text-right"
                      style={{
                        color: col.nullCount > 0 ? "#D85A30" : "#1D9E75",
                      }}
                    >
                      {col.nullCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
