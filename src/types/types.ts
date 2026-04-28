// tensorflow.js
import * as tf from "@tensorflow/tfjs";

// types
import {
  COLUMNS,
  TASKS,
  ACTIVATIONS,
  MODELS,
  OPTIMIZERS,
  TRAINING_STATUS,
} from "@/const/const";

export type ColumnType =
  | typeof COLUMNS.Number
  | typeof COLUMNS.Category
  | typeof COLUMNS.Datetime
  | typeof COLUMNS.Boolean;
export type TaskType = typeof TASKS.Classification | typeof TASKS.Regression;
export type Activation =
  | typeof ACTIVATIONS.ReLU
  | typeof ACTIVATIONS.Sigmoid
  | typeof ACTIVATIONS.Tanh
  | typeof ACTIVATIONS.Softmax
  | typeof ACTIVATIONS.Linear;
export type ModelType =
  | typeof MODELS.NN
  | typeof MODELS.Linear
  | typeof MODELS.Tree;
export type Optimizer =
  | typeof OPTIMIZERS.Adam
  | typeof OPTIMIZERS.SGD
  | typeof OPTIMIZERS.RMSProp;
export type TrainingStatus =
  | typeof TRAINING_STATUS.Idle
  | typeof TRAINING_STATUS.Training
  | typeof TRAINING_STATUS.Paused
  | typeof TRAINING_STATUS.Done
  | typeof TRAINING_STATUS.Error;

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

export interface PreprocessedDataType {
  xTrain: tf.Tensor2D;
  yTrain: tf.Tensor2D;
  xVal: tf.Tensor2D;
  yVal: tf.Tensor2D;
  featureNames: string[];
  classNames: string[];
  normParams: { mean: number[]; std: number[] };
  categoricalMaps: Record<string, string[]>;
  yNormParams: { mean: number; std: number };
}

export type EpochCb = (m: TrainingMetrics) => void;
export type DoneCb = (
  r: ModelResults,
  model: tf.LayersModel,
  normParams: { mean: number[]; std: number[] },
  categoricalMaps: Record<string, string[]>,
  featureNames: string[],
  yNormParams: { mean: number; std: number },
) => void;

export interface ConfusionMatrixPropsType {
  matrix: number[][];
  classNames: string[];
}

export interface FeatureImportancePropsType {
  data: { feature: string; importance: number }[];
}

export interface RocClass {
  fpr: number[];
  tpr: number[];
  auc: number;
}

export interface RocCurvePropsType {
  data: RocClass[];
  classNames: string[];
}

export interface CorrelationHeatmapPropsTypes {
  labels: string[];
  matrix: number[][];
}

export interface PredictedVsActualPropsTypes {
  predictions: { actual: unknown; predicted: unknown }[];
}
