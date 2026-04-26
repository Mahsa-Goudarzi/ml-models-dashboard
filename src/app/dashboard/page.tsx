"use client";

// react
import { useEffect } from "react";

// next
import { useRouter } from "next/navigation";

// components
import { useDatasetStore } from "@/core/store/datasetStore";
import { useTrainingStore } from "@/core/store/trainingStore";
import { getScatterData } from "@/core/data/stats";

// components
import AppShell from "@/components/ui/AppShell";
import ScatterPlot from "@/components/charts/ScatterPlot";
import LossCurve from "@/components/charts/LossCurve";
import NeuralNetVisualization from "@/components/ml/NeuralNetVisualization";

// types
import { Column } from "@/types/types";

// constants
import { COLUMNS } from "@/const/const";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-primary)] p-4 flex flex-col gap-2.5 overflow-hidden">
      <div className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.6px]">
        {title}
      </div>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex-1 bg-[var(--bg-secondary)] rounded-md p-2.5">
      <div className="text-[10px] text-[var(--text-tertiary)] mb-1">
        {label}
      </div>
      <div
        className="text-[18px] font-medium"
        style={{ color: color ?? "var(--text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // app scope states
  const dataset = useDatasetStore((s) => s.dataset);
  const history = useTrainingStore((s) => s.history);
  const status = useTrainingStore((s) => s.status);

  // router
  const router = useRouter();

  // bar height calculator function
  const CalculateBarHeights = (numCols: Column[]) => {
    const maxRange = Math.max(
      ...numCols.map((c) => (c.max ?? 0) - (c.min ?? 0)),
      1,
    );
    return numCols.slice(0, 12).map((col) => {
      const range = (col.max ?? 0) - (col.min ?? 0);
      return Math.max(4, Math.round((range / maxRange) * 56));
    });
  };

  // useEffect handling the case when no dataset uploaded
  useEffect(() => {
    if (!dataset) router.replace("/");
  }, [dataset, router]);

  if (!dataset) return null;

  // scatter plot constants
  const numericCols = dataset.columns.filter(
    (c) => c.type === COLUMNS.Number && !c.isTarget && !c.isIdentifier,
  );
  const xCol = numericCols[2]?.name ?? numericCols[0]?.name ?? "";
  const yCol = numericCols[3]?.name ?? numericCols[1]?.name ?? "";
  const scatterData =
    xCol && yCol
      ? getScatterData(dataset, xCol, yCol, dataset.targetColumn ?? undefined)
      : [];

  const lastMetrics = history.at(-1);

  const barHeights = CalculateBarHeights(numericCols);

  return (
    <AppShell>
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-[var(--border)] overflow-hidden">
        <Panel title="dataset stats">
          <div className="flex gap-2">
            <StatCard label="rows" value={dataset.rowCount.toLocaleString()} />
            <StatCard
              label="features"
              value={String(numericCols.length)}
              color="#534AB7"
            />
            <StatCard
              label="accuracy"
              value={
                lastMetrics?.accuracy
                  ? `${lastMetrics.accuracy.toFixed(1)}%`
                  : "-"
              }
              color="#1D9E75"
            />
          </div>
          <div className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.6px] mt-1">
            numerical features distribution
          </div>
          <div className="flex items-end gap-1 h-16">
            {numericCols.slice(0, 12).map((col, i) => (
              <div
                key={col.name}
                className="flex-1 flex flex-col items-center gap-0.5"
              >
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: barHeights[i],
                    background:
                      i % 4 === 0
                        ? "#7F77DD"
                        : i % 4 === 1
                          ? "#378ADD"
                          : i % 4 === 2
                            ? "#1D9E75"
                            : "#EBAC97",
                    opacity: 0.8,
                  }}
                  title={`${col.name} range: ${col.min?.toFixed(1)} – ${col.max?.toFixed(1)}`}
                />
                <div
                  className="text-[8px] text-[var(--text-tertiary)] w-full text-center truncate"
                  title={col.name}
                >
                  {col.name}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={`scatter - ${xCol} vs ${yCol}`}>
          {scatterData.length > 0 ? (
            <ScatterPlot data={scatterData} xLabel={xCol} yLabel={yCol} />
          ) : (
            <div className="text-[11px] text-[var(--text-tertiary)] m-auto">
              need numeric columns to show scatter plot
            </div>
          )}
        </Panel>

        <Panel title="neural network">
          <NeuralNetVisualization classes="max-h-[260]" />
          <div className="text-[10px] text-[var(--text-tertiary)] text-center">
            {useTrainingStore
              .getState()
              .config.layers.map((l) => l.units)
              .join(" → ")}{" "}
            · relu · softmax
          </div>
        </Panel>

        <Panel title="training progress">
          {history.length > 0 ? (
            <>
              <div className="flex gap-2">
                <StatCard
                  label="epoch"
                  value={`${history.at(-1)!.epoch} / ${useTrainingStore.getState().config.epochs}`}
                />
                <StatCard
                  label="loss"
                  value={history.at(-1)!.loss.toFixed(4)}
                />
              </div>
              <div className="flex-1 min-h-0">
                <LossCurve history={history} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[12px] text-[var(--text-tertiary)]">
              no training yet
              <button
                onClick={() => router.push("/train")}
                className="px-4 py-1.5 bg-[#534AB7] text-white text-[11px] rounded-md hover:bg-[#3C3489] transition-colors cursor-pointer"
              >
                go to training
              </button>
            </div>
          )}
        </Panel>
      </div>

      <div className="h-7 border-t border-[var(--border)] flex items-center px-4 gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
        <span className="text-[10px] text-[var(--text-tertiary)]">
          {dataset.fileName} · {dataset.rowCount} rows ·{" "}
          {dataset.columns.length} cols
        </span>
        <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">
          status:{" "}
          <span className="text-[var(--text-primary)] font-medium">
            {status}
          </span>
        </span>
      </div>
    </AppShell>
  );
}
