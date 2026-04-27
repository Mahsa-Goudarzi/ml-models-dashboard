"use client";

// react
import { useState } from "react";

// stores
import { useTrainingStore } from "@/core/store/trainingStore";
import { useDatasetStore } from "@/core/store/datasetStore";

// tensorflow.js
import * as tf from "@tensorflow/tfjs";

// utils
import { getCategoricalFeatures, getNumericFeatures } from "@/utils/utils";

// constants
import { TASKS } from "@/const/const";

export default function PredictionPanel() {
  // state from stores
  const tfModel = useTrainingStore((s) => s.tfModel) as tf.LayersModel | null;
  const { results, categoricalMaps, normParams, yNormParams } =
    useTrainingStore();
  const dataset = useDatasetStore((s) => s.dataset);
  const isRegression = useDatasetStore(
    (s) => s.dataset?.taskType === TASKS.Regression,
  );

  // useStates
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [predictions, setPredictions] = useState<
    { class: string; prob: number }[]
  >([]);
  const [loading, setLoading] = useState(false);

  if (!tfModel || !dataset || !results) return null;

  // constants
  const numericFeatures = getNumericFeatures(dataset);
  const categoricalFeatures = getCategoricalFeatures(dataset);
  const classNames = results.classNames;

  const predict = async () => {
    if (!normParams) return;
    setLoading(true);
    try {
      // numeric values: normalize
      const numericVals = numericFeatures.map((f, fi) => {
        const v = parseFloat(inputs[f.name] ?? "0") || 0;
        return (v - normParams.mean[fi]) / normParams.std[fi];
      });

      // categorical values: one-hot encode
      const categoricalVals = categoricalFeatures.flatMap((f) => {
        const unique = categoricalMaps[f.name] ?? [];
        const val = inputs[f.name] ?? unique[0] ?? "";
        return unique.map((u) => (u === val ? 1 : 0));
      });

      const x = [...numericVals, ...categoricalVals];
      const tensor = tf.tensor2d([x]);
      const out = tfModel.predict(tensor) as tf.Tensor;
      const probs = (await out.array()) as number[][];

      if (isRegression) {
        const normalized = probs[0][0];
        const realValue = yNormParams
          ? normalized * yNormParams.std + yNormParams.mean
          : normalized;
        setPredictions([{ class: "predicted", prob: realValue }]);
      } else {
        setPredictions(
          probs[0]
            .map((p, i) => ({ class: classNames[i], prob: p }))
            .sort((a, b) => b.prob - a.prob),
        );
      }
      tf.dispose([tensor, out]);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#534AB7", "#1D9E75", "#D85A30", "#378ADD"];

  return (
    <div className="flex flex-col gap-3">
      {/* Numeric inputs */}
      {numericFeatures.map((f) => (
        <div key={f.name} className="flex items-center gap-2">
          <label className="text-[11px] text-[var(--text-secondary)] w-[90px] text-right shrink-0 truncate">
            {f.name}
          </label>
          <input
            type="number"
            placeholder={f.mean?.toFixed(2) ?? "0"}
            value={inputs[f.name] ?? ""}
            onChange={(e) =>
              setInputs((p) => ({ ...p, [f.name]: e.target.value }))
            }
            className="flex-1 text-[11px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-2 py-1.5"
          />
        </div>
      ))}

      {/* Categorical selects */}
      {categoricalFeatures.map((f) => (
        <div key={f.name} className="flex items-center gap-2">
          <label className="text-[11px] text-[var(--text-secondary)] w-[90px] text-right shrink-0 truncate">
            {f.name}
          </label>
          <select
            value={inputs[f.name] ?? categoricalMaps[f.name]?.[0] ?? ""}
            onChange={(e) =>
              setInputs((p) => ({ ...p, [f.name]: e.target.value }))
            }
            className="flex-1 text-[11px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-2 py-1.5"
          >
            {(categoricalMaps[f.name] ?? []).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={predict}
        disabled={loading}
        className="w-full py-1.5 bg-[#534AB7] hover:bg-[#3C3489] text-white text-[11px] font-medium rounded-md transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "predicting…" : "predict ↗"}
      </button>

      {predictions.length > 0 && (
        <div className="bg-[var(--bg-secondary)] rounded-md p-2.5 flex flex-col gap-2">
          {isRegression ? (
            <>
              <div className="text-[10px] text-[var(--text-tertiary)]">
                predicted value
              </div>
              <div className="text-[22px] font-medium text-[#1D9E75]">
                {predictions[0].prob.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] text-[var(--text-tertiary)]">
                prediction probabilities
              </div>
              {predictions.map((p, i) => (
                <div
                  key={p.class}
                  className="flex items-center gap-2 text-[10px]"
                >
                  <div
                    className="w-16 text-right shrink-0 font-medium"
                    style={{ color: COLORS[i % COLORS.length] }}
                  >
                    {p.class}
                  </div>
                  <div className="flex-1 h-2.5 bg-[var(--bg-primary)] rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${p.prob * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <div
                    className="w-10 font-medium"
                    style={{ color: COLORS[i % COLORS.length] }}
                  >
                    {(p.prob * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
