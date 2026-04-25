import Papa from "papaparse";
import type { Dataset, Column, ColumnType } from "@/types/types";

function detectType(values: unknown[]): ColumnType {
  const sample = values.filter((v) => v != null && v !== "").slice(0, 200);
  if (sample.length === 0) return "categorical";
  const numericCount = sample.filter((v) => !isNaN(Number(v))).length;
  if (numericCount / sample.length > 0.85) return "numeric";
  const unique = new Set(sample.map(String));
  if (unique.size <= 30) return "categorical";
  const dateCount = sample.filter((v) => !isNaN(Date.parse(String(v)))).length;
  if (dateCount / sample.length > 0.8) return "datetime";
  return "categorical";
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
    isIdentifier: type === "numeric" && isIdentifierColumn(name, nonNull),
  };

  if (type === "numeric") {
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
        ];
        let targetIdx = columns.findIndex((c) =>
          targetKeywords.includes(c.name.toLowerCase()),
        );
        if (targetIdx === -1) {
          targetIdx =
            columns
              .map((c, i) => ({ c, i }))
              .filter(({ c }) => c.type === "categorical")
              .at(-1)?.i ?? -1;
        }

        if (targetIdx !== -1) columns[targetIdx].isTarget = true;
        const targetCol = columns.find((c) => c.isTarget);

        resolve({
          rows,
          columns,
          rowCount: rows.length,
          taskType:
            targetCol?.type === "numeric" ? "regression" : "classification",
          targetColumn: targetCol?.name ?? null,
          fileName: file.name,
        });
      },
      error: (err: Error) => reject(err),
    });
  });
}
