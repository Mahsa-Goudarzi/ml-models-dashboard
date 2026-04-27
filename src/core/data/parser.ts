import Papa from "papaparse";

// types
import type { Dataset, Column, ColumnType, TaskType } from "@/types/types";

// constants
import { COLUMNS, TASKS, MAX_CATEGORIES } from "@/const/const";

function detectType(values: unknown[]): ColumnType {
  const sample = values.filter((v) => v != null && v !== "").slice(0, 200);
  if (sample.length === 0) return COLUMNS.Category;

  const boolValues = new Set([
    "true",
    "false",
    "0",
    "1",
    "yes",
    "no",
    "t",
    "f",
  ]);
  const unique = new Set(sample.map((v) => String(v).toLowerCase()));
  if (unique.size === 2 && [...unique].every((v) => boolValues.has(v)))
    return COLUMNS.Boolean;

  const numericCount = sample.filter((v) => !isNaN(Number(v))).length;
  if (numericCount / sample.length > 0.85) return COLUMNS.Number;

  if (unique.size <= 30) return COLUMNS.Category;

  const dateCount = sample.filter((v) => !isNaN(Date.parse(String(v)))).length;
  if (dateCount / sample.length > 0.8) return COLUMNS.Datetime;

  return COLUMNS.Category;
}

function isIdentifierColumn(name: string, values: unknown[]): boolean {
  const idNames = [
    "id",
    "index",
    "row",
    "no",
    "num",
    "number",
    "passengerid",
    "userid",
    "customerid",
  ];
  if (idNames.includes(name.toLowerCase())) return true;
  if (/^(id|idx|index)$/i.test(name)) return true;
  if (/_id$/i.test(name) || /^id_/i.test(name)) return true;

  // if the column valuesa are sequential integers, it's probably the id column
  const nums = values.map(Number).filter((n) => !isNaN(n));
  if (nums.length < values.length * 0.9) return false;

  const sorted = [...nums].sort((a, b) => a - b);
  const isSequential = sorted.every(
    (v, i) => i === 0 || v - sorted[i - 1] <= 2,
  );
  const allUnique = new Set(nums).size === nums.length;
  const isInteger = nums.every((n) => Number.isInteger(n));

  return allUnique && isSequential && isInteger && nums.length > 10;
}

function analyzeColumn(name: string, rawValues: unknown[]): Column {
  const nonNull = rawValues.filter((v) => v != null && v !== "");
  const nullCount = rawValues.length - nonNull.length;
  const type = detectType(nonNull);
  const unique = new Set(rawValues.map(String));

  const col: Column = {
    name,
    type,
    nullCount,
    uniqueCount: unique.size,
    isTarget: false,
    values: nonNull.slice(0, 500) as (string | number)[],
    isIdentifier: type === COLUMNS.Number && isIdentifierColumn(name, nonNull),
  };

  if (type === COLUMNS.Number) {
    const nums = nonNull
      .map(Number)
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
    col.min = nums[0];
    col.max = nums[nums.length - 1];
    col.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const mid = Math.floor(nums.length / 2);
    col.median =
      nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    const variance =
      nums.reduce((a, b) => a + (b - col.mean!) ** 2, 0) / nums.length;
    col.std = Math.sqrt(variance);
  }

  return col;
}

export async function parseCSV(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
        const rows = results.data as Record<string, unknown>[];
        if (!rows.length) {
          reject(new Error("Empty file"));
          return;
        }

        const colNames = Object.keys(rows[0]);
        const columns = colNames.map((name) =>
          analyzeColumn(
            name,
            rows.map((r) => r[name]),
          ),
        );

        // Auto-detect target column
        const targetKeywords = [
          "label",
          "target",
          "class",
          "species",
          "survived",
          "price",
          "output",
          "y",
          "result",
          "median_house_value",
        ];
        let targetIdx = columns.findIndex((c) =>
          targetKeywords.includes(c.name.toLowerCase()),
        );
        if (targetIdx === -1) {
          targetIdx =
            columns
              .map((c, i) => ({ c, i }))
              .filter(({ c }) => c.type === COLUMNS.Category)
              .at(-1)?.i ?? -1;
        }

        if (targetIdx !== -1) columns[targetIdx].isTarget = true;

        const targetCol = columns.find((c) => c.isTarget);
        const isLikelyClassification =
          targetCol?.type === COLUMNS.Number &&
          targetCol.uniqueCount <= MAX_CATEGORIES;

        if (isLikelyClassification && targetCol) {
          const idx = columns.findIndex((c) => c.isTarget);
          columns[idx] = { ...columns[idx], type: COLUMNS.Category };
        }

        const taskType: TaskType =
          targetCol?.type === COLUMNS.Category ||
          targetCol?.type === COLUMNS.Boolean ||
          isLikelyClassification
            ? TASKS.Classification
            : TASKS.Regression;

        resolve({
          rows,
          columns,
          rowCount: rows.length,
          taskType,
          targetColumn: targetCol?.name ?? null,
          fileName: file.name,
        });
      },
      error: (err: Error) => reject(err),
    });
  });
}
