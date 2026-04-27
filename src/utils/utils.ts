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
