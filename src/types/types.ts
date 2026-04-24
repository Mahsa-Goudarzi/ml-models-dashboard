export type ColumnType = "numeric" | "categorical" | "datetime" | "boolean";
export type TaskType = "classification" | "regression";

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
}

export interface Dataset {
  rows: Record<string, unknown>[];
  columns: Column[];
  rowCount: number;
  taskType: TaskType | null;
  targetColumn: string | null;
  fileName: string;
}
