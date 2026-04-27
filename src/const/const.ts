export const COLUMNS = {
  Number: "numeric",
  Category: "categorical",
  Datetime: "datetime",
  Boolean: "boolean",
};

export const TASKS = {
  Classification: "classification",
  Regression: "regression",
};

export const ACTIVATIONS = {
  ReLU: "relu",
  Sigmoid: "sigmoid",
  Tanh: "tanh",
  Softmax: "softmax",
  Linear: "linear",
} as const;

export const MODELS = {
  NN: "neural_net",
  Linear: "linear",
  Tree: "decision_tree",
};

export const OPTIMIZERS = {
  Adam: "adam",
  SGD: "sgd",
  RMSProp: "rmsprop",
} as const;

export const TRAINING_STATUS = {
  Idle: "idle",
  Training: "training",
  Paused: "paused",
  Done: "done",
  Error: "error",
};

export const LRS = [0.0001, 0.001, 0.01, 0.1];
export const BATCH_SIZES = [8, 16, 32, 64, 128];
export const EPOCH_OPTIONS = [10, 20, 50, 100, 200, 500];
export const DROPOUTS = [0, 0.1, 0.2, 0.3, 0.5];

export const MAX_CATEGORIES = 20;
