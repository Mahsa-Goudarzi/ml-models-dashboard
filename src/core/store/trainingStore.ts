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

// contants
import {
  ACTIVATIONS,
  MODELS,
  OPTIMIZERS,
  TRAINING_STATUS,
} from "@/const/const";

interface TrainingState {
  config: ModelConfig;
  status: TrainingStatus;
  history: TrainingMetrics[];
  currentEpoch: number;
  results: ModelResults | null;
  tfModel: unknown | null;
  categoricalMaps: Record<string, string[]>;
  featureNames: string[];
  normParams: { mean: number[]; std: number[] } | null;
  yNormParams: { mean: number; std: number } | null;

  setConfig: (config: Partial<ModelConfig>) => void;
  pushMetrics: (m: TrainingMetrics) => void;
  setStatus: (s: TrainingStatus) => void;
  setResults: (r: ModelResults) => void;
  setModel: (m: unknown) => void;
  setCategoricalMaps: (maps: Record<string, string[]>) => void;
  setFeatureNames: (names: string[]) => void;
  setNormParams: (params: { mean: number[]; std: number[] }) => void;
  setYNormParams: (param: { mean: number; std: number }) => void;
  reset: () => void;
}

const DEFAULT_CONFIG: ModelConfig = {
  type: MODELS.NN,
  layers: [
    { id: "h1", units: 8, activation: ACTIVATIONS.ReLU },
    { id: "h2", units: 6, activation: ACTIVATIONS.ReLU },
  ],
  optimizer: OPTIMIZERS.Adam,
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
      status: TRAINING_STATUS.Idle,
      history: [],
      currentEpoch: 0,
      results: null,
      tfModel: null,
      categoricalMaps: {},
      featureNames: [],
      normParams: null,
      yNormParams: null,

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

      setCategoricalMaps: (maps) =>
        set((s) => {
          s.categoricalMaps = maps;
        }),

      setFeatureNames: (names) =>
        set((s) => {
          s.featureNames = names;
        }),

      setNormParams: (params) =>
        set((s) => {
          s.normParams = params;
        }),

      setYNormParams: (param) =>
        set((s) => {
          s.yNormParams = param;
        }),

      reset: () =>
        set((s) => {
          s.status = TRAINING_STATUS.Idle;
          s.history = [];
          s.currentEpoch = 0;
          s.results = null;
          s.tfModel = null;
          s.categoricalMaps = {};
          s.featureNames = [];
          s.normParams = null;
          s.yNormParams = null;
        }),
    })),
  ),
);
