// constants
import { COLUMNS } from "@/const/const";

// types
import type { Dataset } from "@/types/types";

export function computeCorrelationMatrix(dataset: Dataset) {
  const numericCols = dataset.columns.filter((c) => c.type === COLUMNS.Number);
  const labels = numericCols.map((c) => c.name);

  const vectors = labels.map((name) =>
    dataset.rows.map((r) => Number(r[name])).filter((n) => !isNaN(n)),
  );

  const pearson = (a: number[], b: number[]) => {
    const n = Math.min(a.length, b.length);
    const mA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
    const mB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
    let num = 0,
      dA = 0,
      dB = 0;
    for (let i = 0; i < n; i++) {
      const a_ = a[i] - mA,
        b_ = b[i] - mB;
      num += a_ * b_;
      dA += a_ ** 2;
      dB += b_ ** 2;
    }
    return dA === 0 || dB === 0 ? 0 : num / Math.sqrt(dA * dB);
  };

  const matrix = vectors.map((a, i) =>
    vectors.map((b, j) => (i === j ? 1 : parseFloat(pearson(a, b).toFixed(3)))),
  );
  return { labels, matrix };
}

export function computeClassBalance(dataset: Dataset): Record<string, number> {
  if (!dataset.targetColumn) return {};
  const counts: Record<string, number> = {};
  for (const row of dataset.rows) {
    const val = String(row[dataset.targetColumn]);
    counts[val] = (counts[val] ?? 0) + 1;
  }
  return counts;
}

export function getScatterData(
  dataset: Dataset,
  xCol: string,
  yCol: string,
  colorCol?: string,
) {
  return dataset.rows
    .map((r) => ({
      x: Number(r[xCol]),
      y: Number(r[yCol]),
      label: colorCol ? String(r[colorCol]) : undefined,
    }))
    .filter((d) => !isNaN(d.x) && !isNaN(d.y));
}
