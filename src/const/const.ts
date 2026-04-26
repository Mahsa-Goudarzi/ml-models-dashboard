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
};

export const MODELS = {
  NN: "neural_net",
  Linear: "linear",
  Tree: "decision_tree",
};

export const OPTIMIZERS = {
  Adam: "adam",
  SGD: "sgd",
  RMSProp: "rmsprop",
};

export const TRAINING_STATUS = {
  Idle: "idle",
  Training: "training",
  Paused: "paused",
  Done: "done",
  Error: "error",
};
