import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { COLUMNS, MAX_CATEGORIES } from "@/const/const";
import { Dataset } from "@/types/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNumericFeatures(dataset: Dataset | null) {
  return (
    dataset?.columns.filter(
      (c) => !c.isTarget && !c.isIdentifier && c.type === COLUMNS.Number,
    ) ?? []
  );
}

export function getCategoricalFeatures(dataset: Dataset | null) {
  return (
    dataset?.columns.filter(
      (c) =>
        !c.isTarget &&
        !c.isIdentifier &&
        (c.type === COLUMNS.Category || c.type === COLUMNS.Boolean) &&
        c.uniqueCount <= MAX_CATEGORIES,
    ) ?? []
  );
}

export function getNumberOfAllFeatures(dataset: Dataset) {
  return (
    getNumericFeatures(dataset).length + getCategoricalFeatures(dataset).length
  );
}

export const getVisibleNeurons = (total: number, maxVisible = 6) => {
  if (total <= maxVisible) {
    return {
      indices: Array.from({ length: total }, (_, i) => i),
      hasEllipsis: false,
      ellipsisAfter: -1,
    };
  }
  const half = Math.floor(maxVisible / 2);
  return {
    indices: [
      ...Array.from({ length: half }, (_, i) => i),
      ...Array.from({ length: half }, (_, i) => total - half + i),
    ],
    hasEllipsis: true,
    ellipsisAfter: half - 1, // indices that we wanna put dots after
  };
};
