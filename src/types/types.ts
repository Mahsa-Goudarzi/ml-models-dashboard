// types
import { TASKS } from "@/const/const";

export type ColumnType = "numeric" | "categorical" | "datetime" | "boolean";
export type TaskType = typeof TASKS.Classification | typeof TASKS.Regression;
export type Activation = "relu" | "sigmoid" | "tanh" | "softmax" | "linear";
export type ModelType = "neural_net" | "linear" | "decision_tree";
export type Optimizer = "adam" | "sgd" | "rmsprop";
export type TrainingStatus = "idle" | "training" | "paused" | "done" | "error";

export interface Column {
  name: string;
  type: ColumnType;
  min?: number;
  max?: number;
  mean?: number;
  std?: number;
  median?: number;
  nullCount: number;
  uniqueCount: number;
  isTarget: boolean;
  values?: (string | number)[]; // sample for EDA
  isIdentifier: boolean;
}

export interface Dataset {
  rows: Record<string, unknown>[];
  columns: Column[];
  rowCount: number;
  taskType: TaskType | null;
  targetColumn: string | null;
  fileName: string;
}

export interface LayerConfig {
  id: string;
  units: number;
  activation: Activation;
}

export interface ModelConfig {
  type: ModelType;
  layers: LayerConfig[];
  optimizer: Optimizer;
  learningRate: number;
  batchSize: number;
  epochs: number;
  validationSplit: number;
  dropout: number;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  valLoss: number;
  accuracy?: number;
  valAccuracy?: number;
}

export interface ModelResults {
  confusionMatrix: number[][];
  classNames: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  featureImportance: { feature: string; importance: number }[];
  rocData: { fpr: number[]; tpr: number[]; auc: number }[];
  predictions: { actual: unknown; predicted: unknown; confidence: number }[];
}

export interface PointType {
  x: number;
  y: number;
  label?: string;
}
export interface ScatterPlotPropsType {
  data: PointType[];
  xLabel: string;
  yLabel: string;
  colorMap?: Record<string, string>;
}

export interface LossCurvePropsType {
  history: TrainingMetrics[];
}

export interface LayerVizType {
  neurons: number;
  color: string;
  strokeColor: string;
  label: string;
}
