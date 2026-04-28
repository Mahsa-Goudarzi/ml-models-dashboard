// tensorflow.js
import * as tf from "@tensorflow/tfjs";

// ml models
import { buildNeuralNet } from "./models";

// data preprocessing
import { preprocess } from "./preprocess";

// types
import type {
  Dataset,
  ModelConfig,
  ModelResults,
  EpochCb,
  DoneCb,
} from "@/types/types";

// constants
import { TASKS } from "@/const/const";

export async function trainModel(
  dataset: Dataset,
  config: ModelConfig,
  onEpoch: EpochCb,
  onDone: DoneCb,
  signal: AbortSignal,
) {
  await tf.ready();
  const {
    xTrain,
    yTrain,
    xVal,
    yVal,
    featureNames,
    classNames,
    normParams,
    categoricalMaps,
    yNormParams,
  } = preprocess(dataset, config.validationSplit);

  const isRegression = dataset?.taskType === TASKS.Regression;
  const model = buildNeuralNet(
    featureNames.length,
    classNames.length,
    config,
    isRegression,
  );
  let stopped = false;
  signal.addEventListener("abort", () => {
    stopped = true;
    model.stopTraining = true;
  });

  await model.fit(xTrain, yTrain, {
    epochs: config.epochs,
    batchSize: config.batchSize,
    validationData: [xVal, yVal],
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        if (stopped) return;
        const valAcc = isRegression
          ? undefined
          : parseFloat(
              ((logs?.val_acc ?? logs?.val_accuracy ?? 0) * 100).toFixed(2),
            );
        onEpoch({
          epoch: epoch + 1,
          loss: parseFloat((logs?.loss ?? 0).toFixed(4)),
          valLoss: parseFloat((logs?.val_loss ?? 0).toFixed(4)),
          accuracy: isRegression
            ? undefined
            : parseFloat(((logs?.acc ?? logs?.accuracy ?? 0) * 100).toFixed(2)),
          valAccuracy: valAcc,
        });
        await tf.nextFrame();
      },
    },
  });

  if (!stopped) {
    const results = await computeResults(
      model,
      xVal,
      yVal,
      classNames,
      featureNames,
      isRegression,
      yNormParams,
    );
    onDone(
      results,
      model,
      normParams,
      categoricalMaps,
      featureNames,
      yNormParams,
    );
  }

  tf.dispose([xTrain, yTrain, xVal, yVal]);
}

async function computeResults(
  model: tf.LayersModel,
  xVal: tf.Tensor2D,
  yVal: tf.Tensor2D,
  classNames: string[],
  featureNames: string[],
  isRegression: boolean,
  yNormParams: { mean: number; std: number } | null,
): Promise<ModelResults> {
  const predTensor = model.predict(xVal) as tf.Tensor2D;
  const predArr = await predTensor.array();
  const trueArr = await yVal.array();

  tf.dispose(predTensor);

  const featureImportance = await computeSaliency(model, xVal, featureNames);

  // regression path
  if (isRegression) {
    const preds = predArr.map((r) => r[0]);
    const actuals = trueArr.map((r) => r[0]);

    const mae =
      preds.reduce((s, p, i) => s + Math.abs(p - actuals[i]), 0) / preds.length;
    const mse =
      preds.reduce((s, p, i) => s + (p - actuals[i]) ** 2, 0) / preds.length;
    const meanActual = actuals.reduce((a, b) => a + b, 0) / actuals.length;
    const ssTot = actuals.reduce((s, v) => s + (v - meanActual) ** 2, 0);
    const ssRes = preds.reduce((s, p, i) => s + (p - actuals[i]) ** 2, 0);
    const r2 = 1 - ssRes / ssTot;

    // denormalize predictions and actuals
    const denorm = (v: number) =>
      yNormParams ? v * yNormParams.std + yNormParams.mean : v;

    const predsDenorm = preds.map(denorm);
    const actualsDenorm = actuals.map(denorm);

    return {
      confusionMatrix: [],
      classNames: [],
      accuracy: parseFloat(r2.toFixed(2)), // R2 as accuracy
      precision: parseFloat(mae.toFixed(2)), // MAE
      recall: parseFloat(Math.sqrt(mse).toFixed(2)), // RMSE
      f1: 0,
      featureImportance,
      rocData: [],
      predictions: actualsDenorm.map((a, i) => ({
        actual: a,
        predicted: predsDenorm[i],
        confidence:
          1 -
          Math.abs(preds[i] - a) /
            (Math.max(...actuals) - Math.min(...actuals)),
      })),
    };
  }

  // classification path
  const predicted = predArr.map((row) => row.indexOf(Math.max(...row)));
  const actual = trueArr.map((row) => row.indexOf(1));
  const confidence = predArr.map((row) => Math.max(...row));

  const n = classNames.length;
  const cm = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < predicted.length; i++) cm[actual[i]][predicted[i]]++;

  const precisions = classNames.map((_, ci) => {
    const tp = cm[ci][ci];
    const fp = cm.reduce((s, row, ri) => s + (ri !== ci ? row[ci] : 0), 0);
    return tp / (tp + fp) || 0;
  });
  const recalls = classNames.map((_, ci) => {
    const tp = cm[ci][ci];
    const fn = cm[ci].reduce((s, v, ji) => s + (ji !== ci ? v : 0), 0);
    return tp / (tp + fn) || 0;
  });

  const precision = precisions.reduce((a, b) => a + b, 0) / n;
  const recall = recalls.reduce((a, b) => a + b, 0) / n;
  const f1 = (2 * precision * recall) / (precision + recall) || 0;
  const accuracy =
    actual.filter((a, i) => a === predicted[i]).length / actual.length;

  const rocData = classNames.map((_, ci) => {
    const scores = predArr.map((r) => r[ci]);
    const labels = actual.map((a) => (a === ci ? 1 : 0));
    return computeROC(scores, labels);
  });

  return {
    confusionMatrix: cm,
    classNames,
    accuracy: parseFloat((accuracy * 100).toFixed(2)),
    precision: parseFloat((precision * 100).toFixed(2)),
    recall: parseFloat((recall * 100).toFixed(2)),
    f1: parseFloat((f1 * 100).toFixed(2)),
    featureImportance,
    rocData,
    predictions: actual.map((a, i) => ({
      actual: classNames[a],
      predicted: classNames[predicted[i]],
      confidence: parseFloat((confidence[i] * 100).toFixed(1)),
    })),
  };
}

async function computeSaliency(
  model: tf.LayersModel,
  xVal: tf.Tensor2D,
  featureNames: string[],
) {
  return tf.tidy(() => {
    const sample = xVal.slice([0], [Math.min(50, xVal.shape[0])]);
    const grads = tf.grad((x: tf.Tensor) =>
      (model.predict(x) as tf.Tensor).mean(),
    )(sample);
    const importance = grads.abs().mean(0).arraySync() as number[];
    const total = importance.reduce((a, b) => a + b, 0) || 1;
    return featureNames
      .map((feature, i) => ({
        feature,
        importance: parseFloat(((importance[i] / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.importance - a.importance);
  });
}

function computeROC(scores: number[], labels: number[]) {
  const thresholds = [...new Set(scores)].sort((a, b) => b - a);
  const pts = thresholds.map((t) => {
    let tp = 0,
      fp = 0,
      fn = 0,
      tn = 0;
    for (let i = 0; i < scores.length; i++) {
      const pred = scores[i] >= t ? 1 : 0;
      if (labels[i] === 1 && pred === 1) tp++;
      else if (labels[i] === 0 && pred === 1) fp++;
      else if (labels[i] === 1 && pred === 0) fn++;
      else tn++;
    }
    return { tpr: tp / (tp + fn) || 0, fpr: fp / (fp + tn) || 0 };
  });
  const fpr = [0, ...pts.map((p) => p.fpr), 1];
  const tpr = [0, ...pts.map((p) => p.tpr), 1];
  const auc = fpr
    .slice(1)
    .reduce((a, x, i) => a + (x - fpr[i]) * ((tpr[i + 1] + tpr[i]) / 2), 0);
  return { fpr, tpr, auc: parseFloat(auc.toFixed(3)) };
}
