"use client";

// react
import { useEffect } from "react";

// next
import { useRouter } from "next/navigation";

//tensorflow.js
import * as tf from "@tensorflow/tfjs";

// store
import { useTrainingStore } from "@/core/store/trainingStore";
import { useDatasetStore } from "@/core/store/datasetStore";

// components
import AppShell from "@/components/ui/AppShell";
import ConfusionMatrix from "@/components/charts/ConfusionMatrix";
import FeatureImportance from "@/components/charts/FeatureImportance";
import RocCurve from "@/components/charts/RocCurve";
import PredictionPanel from "@/components/ml/PredictionPanel";
import Panel from "@/components/ui/Panel";
import PredictedVsActual from "@/components/charts/PredictedVsActual";

function MetricItem(metric: { label: string; value: string; color?: string }) {
  return (
    <div key={metric.label} className="flex items-center gap-1.5 text-[10px]">
      <span className="text-[var(--text-tertiary)]">{metric.label}</span>
      <span className="font-medium" style={{ color: metric.color }}>
        {metric.value}
      </span>
    </div>
  );
}

export default function ResultsPage() {
  // app scope states
  const dataset = useDatasetStore((s) => s.dataset);
  const results = useTrainingStore((s) => s.results);
  const tfModel = useTrainingStore((s) => s.tfModel) as tf.LayersModel | null;
  const { normParams, yNormParams, categoricalMaps, featureNames } =
    useTrainingStore();
  const isRegression = results?.classNames.length === 0;

  // router
  const router = useRouter();

  // handler functions
  const handleExport = async () => {
    if (!tfModel) return;

    await tfModel.save("downloads://mlens-model");

    const metadata = {
      normParams,
      yNormParams,
      categoricalMaps,
      featureNames,
      classNames: results?.classNames,
      taskType: dataset?.taskType,
    };
    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mlens-metadata.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // useEffects
  useEffect(() => {
    if (!results) router.replace("/train");
  }, [results, router]);

  if (!results) return null;

  return (
    <AppShell>
      <div className="h-11 border-b border-[var(--border)] flex items-center px-4 gap-2 shrink-0">
        <button
          onClick={handleExport}
          disabled={!tfModel}
          className="ml-auto cursor-pointer text-[11px] px-3 py-1 border border-[#7F77DD] text-[#534AB7] rounded-md hover:bg-[#EEEDFE] transition-colors"
        >
          export model ↓
        </button>
      </div>

      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-[var(--border)] overflow-hidden">
        {isRegression ? (
          <Panel title="predicted vs actual">
            <PredictedVsActual predictions={results.predictions} />
          </Panel>
        ) : (
          <Panel title="confusion matrix">
            <ConfusionMatrix
              matrix={results.confusionMatrix}
              classNames={results.classNames}
            />
          </Panel>
        )}

        <Panel title="feature importance">
          <FeatureImportance data={results.featureImportance} />
          <div className="text-[10px] text-[var(--text-tertiary)] mt-auto">
            via gradient × activation
          </div>
        </Panel>

        {isRegression ? (
          <Panel title="metrics summary">
            <div className="flex flex-col gap-4 justify-center flex-1">
              {[
                {
                  label: "R² Score",
                  value: `${results.accuracy}`,
                  desc: "variance explained by model",
                  color: "#1D9E75",
                },
                {
                  label: "MAE",
                  value: `${results.precision}`,
                  desc: "mean absolute error",
                  color: "#534AB7",
                },
                {
                  label: "RMSE",
                  value: `${results.recall}`,
                  desc: "root mean squared error",
                  color: "#378ADD",
                },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5 w-24 shrink-0">
                    <div className="text-[10px] text-[var(--text-tertiary)]">
                      {m.label}
                    </div>
                    <div
                      className="text-[20px] font-medium"
                      style={{ color: m.color }}
                    >
                      {m.value}
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : (
          <Panel title="ROC curve">
            <RocCurve data={results.rocData} classNames={results.classNames} />
          </Panel>
        )}

        <Panel title="live prediction">
          <PredictionPanel />
        </Panel>
      </div>

      <div className="h-7 border-t border-[var(--border)] flex items-center px-4 gap-4 shrink-0">
        {isRegression ? (
          // regression metrics
          <>
            <MetricItem
              label="R²"
              value={`${results.accuracy}`}
              color="#1D9E75"
            />
            <MetricItem
              label="MAE"
              value={`${results.precision}`}
              color="#534AB7"
            />
            <MetricItem
              label="RMSE"
              value={`${results.recall}`}
              color="#378ADD"
            />
          </>
        ) : (
          // classification metrics
          <>
            <MetricItem
              label="accuracy"
              value={`${results.accuracy}%`}
              color="#1D9E75"
            />
            <MetricItem
              label="precision"
              value={`${results.precision}%`}
              color="#534AB7"
            />
            <MetricItem
              label="recall"
              value={`${results.recall}%`}
              color="#378ADD"
            />
            <MetricItem label="f1" value={`${results.f1}%`} color="#D85A30" />
          </>
        )}
      </div>
    </AppShell>
  );
}
