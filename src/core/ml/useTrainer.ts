"use client";

// react
import { useRef, useCallback } from "react";

// stores
import { useDatasetStore } from "@/core/store/datasetStore";
import { useTrainingStore } from "@/core/store/trainingStore";

// trainer
import { trainModel } from "@/core/ml/trainer";

export function useTrainer() {
  // refs
  const abortRef = useRef<AbortController | null>(null);

  // state management
  const dataset = useDatasetStore((s) => s.dataset);
  const {
    config,
    setStatus,
    pushMetrics,
    setResults,
    setModel,
    setCategoricalMaps,
    setFeatureNames,
    setNormParams,
    setYNormParams,
    reset,
  } = useTrainingStore();

  // training handler functions
  const start = useCallback(async () => {
    if (!dataset) return;
    reset();
    abortRef.current = new AbortController();
    setStatus("training");
    try {
      await trainModel(
        dataset,
        config,
        (m) => pushMetrics(m),
        (r, model, normParams, categoricalMaps, featureNames, yNormParams) => {
          setResults(r);
          setModel(model);
          setNormParams(normParams);
          setCategoricalMaps(categoricalMaps);
          setFeatureNames(featureNames);
          if (yNormParams) setYNormParams(yNormParams);
          setStatus("done");
        },
        abortRef.current.signal,
      );
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [
    dataset,
    config,
    setStatus,
    pushMetrics,
    setResults,
    setModel,
    setNormParams,
    setCategoricalMaps,
    setFeatureNames,
    setYNormParams,
    reset,
  ]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStatus("paused");
  }, [setStatus]);

  return { start, stop };
}
