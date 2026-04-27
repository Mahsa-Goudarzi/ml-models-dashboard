// tensorflow.js
import * as tf from "@tensorflow/tfjs";

// types
import type { ModelConfig } from "@/types/types";

// constants
import { ACTIVATIONS } from "@/const/const";

export function buildNeuralNet(
  inputSize: number,
  outputSize: number,
  config: ModelConfig,
  isRegression = false,
): tf.LayersModel {
  const model = tf.sequential();

  config.layers.forEach((layer, i) => {
    if (i === 0) {
      model.add(
        tf.layers.dense({
          inputShape: [inputSize],
          units: layer.units,
          activation: layer.activation,
          kernelInitializer: "glorotUniform",
        }),
      );
    } else {
      model.add(
        tf.layers.dense({
          units: layer.units,
          activation: layer.activation,
          kernelInitializer: "glorotUniform",
        }),
      );
    }
    if (config.dropout > 0) {
      model.add(tf.layers.dropout({ rate: config.dropout }));
    }
  });

  model.add(
    tf.layers.dense({
      units: isRegression ? 1 : outputSize,
      activation: isRegression ? ACTIVATIONS.Linear : ACTIVATIONS.Softmax,
    }),
  );

  const optimizers = {
    adam: tf.train.adam(config.learningRate),
    sgd: tf.train.sgd(config.learningRate),
    rmsprop: tf.train.rmsprop(config.learningRate),
  };

  model.compile({
    optimizer: optimizers[config.optimizer],
    loss: isRegression ? "meanSquaredError" : "categoricalCrossentropy",
    metrics: isRegression ? ["mse"] : ["accuracy"],
  });

  return model;
}
