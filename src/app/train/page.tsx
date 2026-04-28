"use client";

// react
import { useEffect } from "react";

// next
import { useRouter } from "next/navigation";

// components
import AppShell from "@/components/ui/AppShell";
import LossCurve from "@/components/charts/LossCurve";
import ArchitectureBuilder from "@/components/ml/ArchitectureBuilder";
import NeuralNetVisualization from "@/components/ml/NeuralNetVisualization";

// state management
import { useDatasetStore } from "@/core/store/datasetStore";
import { useTrainingStore } from "@/core/store/trainingStore";
import { useTrainer } from "@/core/ml/useTrainer";

// constants
import {
  OPTIMIZERS,
  LRS,
  BATCH_SIZES,
  EPOCH_OPTIONS,
  DROPOUTS,
  TASKS,
} from "@/const/const";

function MetricItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div key={label} className="flex flex-col gap-0.5">
      <span className="text-[10px] text-[var(--text-tertiary)]">{label}</span>
      <span className="text-[17px] font-medium" style={{ color: color }}>
        {value}
      </span>
    </div>
  );
}

export default function TrainPage() {
  // global states
  const dataset = useDatasetStore((s) => s.dataset);
  const { config, status, history, currentEpoch, setConfig } =
    useTrainingStore();
  const isRegression = useDatasetStore(
    (s) => s.dataset?.taskType === TASKS.Regression,
  );

  // trainer controls
  const { start, stop } = useTrainer();

  // router
  const router = useRouter();

  useEffect(() => {
    if (!dataset) router.replace("/");
  }, [dataset, router]);
  if (!dataset) return null;

  const isTraining = status === "training";
  const lastM = history.at(-1);

  return (
    <AppShell>
      <div className="h-11 border-b border-[var(--border)] flex items-center px-4 gap-3 shrink-0">
        <span className="text-[13px] font-medium text-[var(--text-primary)]">
          train · neural network
        </span>
        {isTraining && (
          <span className="flex items-center gap-1.5 text-[10px] bg-[#E1F5EE] text-[#0F6E56] px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
            training · epoch {currentEpoch}/{config.epochs}
          </span>
        )}
        <button
          onClick={isTraining ? stop : start}
          className="ml-auto px-4 py-1.5 text-[12px] font-medium rounded-md text-white transition-colors cursor-pointer"
          style={{ background: isTraining ? "#D85A30" : "#534AB7" }}
        >
          {isTraining ? "stop" : status === "done" ? "retrain" : "train model"}
        </button>
        {status === "done" && (
          <button
            onClick={() => router.push("/results")}
            className="px-4 py-1.5 text-[12px] font-medium rounded-md border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE] transition-colors cursor-pointer"
          >
            view results →
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Config panel */}
        <div className="w-56 border-r border-[var(--border)] p-3.5 flex flex-col gap-4 overflow-y-auto shrink-0">
          <div>
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.6px] mb-2">
              architecture
            </div>
            <ArchitectureBuilder />
          </div>

          <div>
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.6px] mb-2">
              hyperparameters
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "optimizer",
                  key: "optimizer",
                  options: Object.values(OPTIMIZERS),
                },
                { label: "learning rate", key: "learningRate", options: LRS },
                { label: "batch size", key: "batchSize", options: BATCH_SIZES },
                { label: "epochs", key: "epochs", options: EPOCH_OPTIONS },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <div className="text-[10px] text-[var(--text-secondary)] mb-1">
                    {label}
                  </div>
                  <select
                    value={String(config[key as keyof typeof config])}
                    onChange={(e) => {
                      const v = isNaN(Number(e.target.value))
                        ? e.target.value
                        : Number(e.target.value);
                      setConfig({ [key]: v });
                    }}
                    className="w-full text-[11px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-2 py-1.5"
                    disabled={isTraining}
                  >
                    {options.map((o) => (
                      <option key={String(o)} value={String(o)}>
                        {String(o)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.6px] mb-2">
              regularization
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-secondary)] mb-1">
                dropout
              </div>
              <select
                value={config.dropout}
                onChange={(e) => setConfig({ dropout: Number(e.target.value) })}
                className="w-full text-[11px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-2 py-1.5"
                disabled={isTraining}
              >
                {DROPOUTS.map((d) => (
                  <option key={d} value={d}>
                    {d === 0 ? "none" : d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex gap-px bg-[var(--border)] overflow-hidden">
            <div className="basis-3/5 bg-[var(--bg-primary)] p-4 flex flex-col gap-2">
              <div className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.6px]">
                live network activity
              </div>
              <div className="flex-1">
                <NeuralNetVisualization />
              </div>
            </div>
            <div className="basis-2/5 min-w-56 bg-[var(--bg-primary)] p-4 flex flex-col gap-2 shrink-0">
              <div className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.6px]">
                loss curve
              </div>
              <div className="flex-1 min-h-0">
                <LossCurve history={history} />
              </div>
              {lastM && (
                <div className="flex flex-col gap-1 text-[11px] border-t border-[var(--border)] pt-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">
                      train loss
                    </span>
                    <span className="font-medium text-[#534AB7]">
                      {lastM.loss}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">
                      val loss
                    </span>
                    <span className="font-medium text-[#AFA9EC]">
                      {lastM.valLoss}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">epoch</span>
                    <span className="font-medium">
                      {lastM.epoch} / {config.epochs}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metrics bar */}
          <div className="h-14 border-t border-[var(--border)] flex items-center px-4 gap-6 shrink-0 bg-[var(--bg-primary)]">
            {isRegression ? (
              <>
                {[
                  {
                    label: "RMSE",
                    value: lastM?.loss
                      ? Math.sqrt(lastM.loss).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })
                      : "—",
                    color: "#1D9E75",
                  },
                  {
                    label: "val RMSE",
                    value: lastM?.valLoss
                      ? Math.sqrt(lastM.valLoss).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })
                      : "—",
                    color: "#534AB7",
                  },
                  {
                    label: "loss (MSE)",
                    value: lastM?.loss?.toExponential(2) ?? "—",
                    color: "var(--text-tertiary)",
                  },
                ].map((m) => (
                  <MetricItem {...m} key={m.label} />
                ))}
              </>
            ) : (
              <>
                {[
                  {
                    label: "accuracy",
                    value: lastM?.accuracy
                      ? `${lastM.accuracy.toFixed(1)}%`
                      : "—",
                    color: "#1D9E75",
                  },
                  {
                    label: "val accuracy",
                    value: lastM?.valAccuracy
                      ? `${lastM.valAccuracy.toFixed(1)}%`
                      : "—",
                    color: "#534AB7",
                  },
                  {
                    label: "loss",
                    value: lastM?.loss.toFixed(4) ?? "—",
                    color: "var(--text-primary)",
                  },
                ].map((m) => (
                  <MetricItem {...m} key={m.label} />
                ))}
              </>
            )}
            <div className="ml-auto text-[10px] text-[var(--text-tertiary)]">
              tensorflow.js · in-browser
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
