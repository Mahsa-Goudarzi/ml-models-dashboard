// tensorflow.js
import * as tf from "@tensorflow/tfjs";

// types
import type { Dataset, PreprocessedDataType } from "@/types/types";

// constants
import { TASKS } from "@/const/const";

// utils
import { getCategoricalFeatures, getNumericFeatures } from "@/utils/utils";

export function preprocess(
  dataset: Dataset,
  valSplit = 0.2,
): PreprocessedDataType {
  const target = dataset.targetColumn!;

  const numericFeatures = getNumericFeatures(dataset);
  const categoricalFeatures = getCategoricalFeatures(dataset);

  // one-hot maps for categorical features
  const categoricalMaps = Object.fromEntries(
    categoricalFeatures.map((col) => {
      const unique = [
        ...new Set(dataset.rows.map((r) => String(r[col.name]))),
      ].sort();
      return [col.name, unique];
    }),
  );

  // feature names
  const featureNames = [
    ...numericFeatures.map((c) => c.name),
    ...categoricalFeatures.flatMap((c) =>
      categoricalMaps[c.name].map((v) => `${c.name}=${v}`),
    ),
  ];

  // class map for target
  const isRegression = dataset?.taskType === TASKS.Regression;

  const classNames = isRegression
    ? []
    : [...new Set(dataset.rows.map((r) => String(r[target])))].sort();

  const classMap = Object.fromEntries(classNames.map((c, i) => [c, i]));

  // X_raw
  const X_raw = dataset.rows.map((r) => {
    const numericVals = numericFeatures.map((f) => {
      const v = Number(r[f.name]);
      return isNaN(v) ? 0 : v;
    });
    const categoricalVals = categoricalFeatures.flatMap((f) => {
      const unique = categoricalMaps[f.name];
      const val = String(r[f.name]);
      return unique.map((u) => (u === val ? 1 : 0));
    });
    return [...numericVals, ...categoricalVals];
  });

  const Y_raw = dataset.rows.map((r) => {
    if (isRegression) return Number(r[target]) || 0;
    return classMap[String(r[target])] ?? 0;
  });

  // normalize Y for regression
  let Y_final = Y_raw;
  const yNormParams = { mean: 0, std: 1 };

  if (isRegression) {
    const yMean = Y_raw.reduce((a, b) => a + b, 0) / Y_raw.length;
    const yStd =
      Math.sqrt(
        Y_raw.reduce((a, v) => a + (v - yMean) ** 2, 0) / Y_raw.length,
      ) || 1;
    yNormParams.mean = yMean;
    yNormParams.std = yStd;
    Y_final = Y_raw.map((v) => (v - yMean) / yStd);
  }

  // z-score only on numeric featuree, not on one-hot encoded categorical features
  const numericCount = numericFeatures.length;
  const mean = featureNames.map((_, fi) => {
    if (fi >= numericCount) return 0;
    const col = X_raw.map((r) => r[fi]);
    return col.reduce((a, b) => a + b, 0) / col.length;
  });
  const std = featureNames.map((_, fi) => {
    if (fi >= numericCount) return 1;
    const col = X_raw.map((r) => r[fi]);
    const m = mean[fi];
    return (
      Math.sqrt(col.reduce((a, v) => a + (v - m) ** 2, 0) / col.length) || 1
    );
  });

  const X_norm = X_raw.map((row) =>
    row.map((v, fi) => (v - mean[fi]) / std[fi]),
  );

  // shuffle + split
  const n = X_norm.length;
  const idx = tf.util.createShuffledIndices(n);
  const splitAt = Math.floor(n * (1 - valSplit));
  const trainIdx = Array.from(idx).slice(0, splitAt);
  const valIdx = Array.from(idx).slice(splitAt);

  return {
    xTrain: tf.tensor2d(trainIdx.map((i) => X_norm[i])),
    yTrain: isRegression
      ? tf.tensor2d(trainIdx.map((i) => [Y_final[i]]))
      : (tf.oneHot(
          trainIdx.map((i) => Y_final[i]),
          classNames.length,
        ) as tf.Tensor2D),
    xVal: tf.tensor2d(valIdx.map((i) => X_norm[i])),
    yVal: isRegression
      ? tf.tensor2d(valIdx.map((i) => [Y_final[i]]))
      : (tf.oneHot(
          valIdx.map((i) => Y_final[i]),
          classNames.length,
        ) as tf.Tensor2D),
    featureNames,
    classNames,
    normParams: { mean, std },
    categoricalMaps,
    yNormParams,
  };
}
