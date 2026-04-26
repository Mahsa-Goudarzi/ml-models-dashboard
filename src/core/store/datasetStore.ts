// zustand
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// types
import type { Dataset, Column } from "@/types/types";

// constants
import { MODELS } from "@/const/const";

interface DatasetState {
  dataset: Dataset | null;
  isLoading: boolean;
  error: string | null;
  setDataset: (dataset: Dataset) => void;
  setTargetColumn: (col: string) => void;
  updateColumn: (name: string, updates: Partial<Column>) => void;
  reset: () => void;
}

export const useDatasetStore = create<DatasetState>()(
  subscribeWithSelector(
    immer((set) => ({
      dataset: null,
      isLoading: false,
      error: null,

      setDataset: (dataset) =>
        set((s) => {
          s.dataset = dataset;
        }),

      setTargetColumn: (col) =>
        set((s) => {
          if (!s.dataset) return;
          s.dataset.targetColumn = col;
          s.dataset.columns = s.dataset.columns.map((c: Column) => ({
            ...c,
            isTarget: c.name === col,
          }));
          const targetCol = s.dataset.columns.find(
            (c: Column) => c.name === col,
          );
          s.dataset.taskType =
            targetCol?.type === "numeric"
              ? MODELS.Regression
              : MODELS.Classification;
        }),

      updateColumn: (name, updates) =>
        set((s) => {
          if (!s.dataset) return;
          const idx = s.dataset.columns.findIndex(
            (c: Column) => c.name === name,
          );
          if (idx !== -1) Object.assign(s.dataset.columns[idx], updates);
        }),

      reset: () =>
        set((s) => {
          s.dataset = null;
          s.isLoading = false;
          s.error = null;
        }),
    })),
  ),
);
