// zustand
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// types
import type {
  ModelConfig,
  TrainingMetrics,
  ModelResults,
  TrainingStatus,
} from "@/types/types";

interface TrainingState {
  config: ModelConfig;
  status: TrainingStatus;
  history: TrainingMetrics[];
  currentEpoch: number;
  results: ModelResults | null;
  tfModel: unknown | null;

  setConfig: (config: Partial<ModelConfig>) => void;
  pushMetrics: (m: TrainingMetrics) => void;
  setStatus: (s: TrainingStatus) => void;
  setResults: (r: ModelResults) => void;
  setModel: (m: unknown) => void;
  reset: () => void;
}

const DEFAULT_CONFIG: ModelConfig = {
  type: "neural_net",
  layers: [
    { id: "h1", units: 8, activation: "relu" },
    { id: "h2", units: 6, activation: "relu" },
  ],
  optimizer: "adam",
  learningRate: 0.001,
  batchSize: 32,
  epochs: 100,
  validationSplit: 0.2,
  dropout: 0,
};

export const useTrainingStore = create<TrainingState>()(
  subscribeWithSelector(
    immer((set) => ({
      config: DEFAULT_CONFIG,
      status: "idle",
      history: [],
      currentEpoch: 0,
      results: null,
      tfModel: null,

      setConfig: (config) =>
        set((s) => {
          Object.assign(s.config, config);
        }),

      pushMetrics: (m) =>
        set((s) => {
          s.history.push(m);
          s.currentEpoch = m.epoch;
        }),

      setStatus: (status) =>
        set((s) => {
          s.status = status;
        }),

      setResults: (results) =>
        set((s) => {
          s.results = results;
        }),

      setModel: (model) =>
        set((s) => {
          s.tfModel = model;
        }),

      reset: () =>
        set((s) => {
          s.status = "idle";
          s.history = [];
          s.currentEpoch = 0;
          s.results = null;
          s.tfModel = null;
        }),
    })),
  ),
);
