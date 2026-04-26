"use client";

// react
import { useEffect, useState } from "react";

// next
import { useRouter } from "next/navigation";

// store
import { useDatasetStore } from "@/core/store/datasetStore";

// components
import AppShell from "@/components/ui/AppShell";

// constants
import { COLUMNS } from "@/const/const";

export default function DatasetPage() {
  // router
  const router = useRouter();

  // dataset store
  const dataset = useDatasetStore((s) => s.dataset);
  const setTargetColumn = useDatasetStore((s) => s.setTargetColumn);
  const updateColumn = useDatasetStore((s) => s.updateColumn);

  // states
  const [search, setSearch] = useState("");
  const [selectedCol, setSelectedCol] = useState<string | null>(null);

  // useEffect
  useEffect(() => {
    if (!dataset) router.replace("/");
  }, [dataset, router]);
  if (!dataset) return null;

  // dataset info
  const filteredCols = dataset.columns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const numericCols = dataset.columns.filter((c) => c.type === COLUMNS.Number);
  const nullCount = dataset.columns.reduce((a, c) => a + c.nullCount, 0);

  return (
    <AppShell>
      {/* Topbar */}
      <div className="h-11 border-b border-[var(--border)] flex items-center px-4 gap-2.5 shrink-0">
        <span className="text-[13px] font-medium text-[var(--text-primary)]">
          {dataset.fileName}
        </span>
        <span className="text-[10px] bg-[#EEEDFE] text-[#534AB7] px-2 py-0.5 rounded-full font-medium">
          {dataset.rowCount.toLocaleString()} rows
        </span>
        <span className="text-[10px] bg-[#EEEDFE] text-[#534AB7] px-2 py-0.5 rounded-full font-medium">
          {dataset.columns.length} cols
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            nullCount > 0
              ? "bg-[#FAEEDA] text-[#854F0B]"
              : "bg-[#E1F5EE] text-[#0F6E56]"
          }`}
        >
          {nullCount > 0 ? `${nullCount} nulls` : "0 nulls"}
        </span>
        <div className="ml-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search columns..."
            className="text-[12px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-3 py-1.5 w-40 outline-none focus:border-[#7F77DD]"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Column cards */}
        <div className="flex gap-2 px-4 py-3 border-b border-[var(--border)] overflow-x-auto shrink-0">
          {filteredCols.map((col) => {
            const range = (col.max ?? 0) - (col.min ?? 0);
            const fillPct =
              col.type === COLUMNS.Number && !col.isIdentifier && range > 0
                ? (((col.mean ?? 0) - (col.min ?? 0)) / range) * 100
                : 100;
            const isSelected = selectedCol === col.name;

            return (
              <div
                key={col.name}
                onClick={() => setSelectedCol(isSelected ? null : col.name)}
                className={`shrink-0 rounded-lg p-2.5 min-w-[120px] cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[var(--bg-primary)] border-[1.5px] border-[#7F77DD]"
                    : "bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[#AFA9EC]"
                }`}
              >
                <div className="text-[11px] font-medium text-[var(--text-primary)] mb-0.5 truncate">
                  {col.name}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] mb-2">
                  {col.type}
                  {col.isTarget && " · target"}
                  {col.isIdentifier && " · id"}
                </div>
                <div
                  className="h-1 bg-[var(--border)] rounded-full mb-1.5 overflow-hidden"
                  title={
                    col.type === COLUMNS.Number && !col.isIdentifier
                      ? `mean position: ${col.mean?.toFixed(2)} (between ${col.min?.toFixed(2)} - ${col.max?.toFixed(2)})`
                      : undefined
                  }
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(4, fillPct)}%`,
                      background: col.isTarget
                        ? "#1D9E75"
                        : col.isIdentifier
                          ? "#888780"
                          : "#7F77DD",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-[var(--text-tertiary)]">
                  {col.type === COLUMNS.Number ? (
                    <>
                      <span>{col.min?.toFixed(1)}</span>
                      <span>{col.max?.toFixed(1)}</span>
                    </>
                  ) : (
                    <>
                      <span>{col.uniqueCount} unique</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected col detail */}
        {selectedCol &&
          (() => {
            const col = dataset.columns.find((c) => c.name === selectedCol)!;
            return (
              <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center gap-6 shrink-0">
                <div className="flex flex-col gap-0.5">
                  <div className="text-[10px] text-[var(--text-tertiary)]">
                    column
                  </div>
                  <div className="text-[12px] font-medium text-[var(--text-primary)]">
                    {col.name}
                  </div>
                </div>
                {col.type === COLUMNS.Number && !col.isIdentifier && (
                  <>
                    {[
                      { label: "mean", value: col.mean?.toFixed(3) },
                      { label: "std", value: col.std?.toFixed(3) },
                      { label: "min", value: col.min?.toFixed(3) },
                      { label: "max", value: col.max?.toFixed(3) },
                      { label: "nulls", value: col.nullCount },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <div className="text-[10px] text-[var(--text-tertiary)]">
                          {label}
                        </div>
                        <div className="text-[12px] font-medium text-[var(--text-primary)]">
                          {value}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {col.type === COLUMNS.Category && (
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-[var(--text-tertiary)]">
                      unique values
                    </div>
                    <div className="text-[12px] font-medium text-[var(--text-primary)]">
                      {col.uniqueCount}
                    </div>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    set as target
                  </span>
                  <button
                    onClick={() => setTargetColumn(col.name)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${
                      col.isTarget
                        ? "bg-[#1D9E75] text-white"
                        : "border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE]"
                    }`}
                  >
                    {col.isTarget ? "✓ target" : "set target"}
                  </button>
                  <button
                    onClick={() =>
                      updateColumn(col.name, {
                        isIdentifier: !col.isIdentifier,
                      })
                    }
                    className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${
                      col.isIdentifier
                        ? "bg-[#888780] text-white"
                        : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
                    }`}
                  >
                    {col.isIdentifier ? "✓ identifier" : "mark as id"}
                  </button>
                </div>
              </div>
            );
          })()}

        {/* Data table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="sticky top-0 bg-[var(--bg-secondary)] z-10">
                <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.5px] border-b border-[var(--border)] w-10">
                  #
                </th>
                {dataset.columns.map((col) => (
                  <th
                    key={col.name}
                    onClick={() =>
                      setSelectedCol(col.name === selectedCol ? null : col.name)
                    }
                    className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-[0.5px] border-b border-[var(--border)] cursor-pointer hover:text-[var(--text-primary)] whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      {col.name}
                      {col.isTarget && (
                        <span className="text-[8px] bg-[#E1F5EE] text-[#0F6E56] px-1 py-0.5 rounded font-medium normal-case">
                          target
                        </span>
                      )}
                      {col.isIdentifier && (
                        <span className="text-[8px] bg-[var(--bg-primary)] text-[var(--text-tertiary)] px-1 py-0.5 rounded font-medium normal-case border border-[var(--border)]">
                          id
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.rows.slice(0, 100).map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <td className="px-3 py-1.5 text-[var(--text-tertiary)] font-mono text-[11px]">
                    {ri + 1}
                  </td>
                  {dataset.columns.map((col) => {
                    const val = row[col.name];
                    const isNull = val == null || val === "";
                    const isCat =
                      col.type === COLUMNS.Category ||
                      col.type === COLUMNS.Boolean;

                    return (
                      <td
                        key={col.name}
                        className="px-3 py-1.5 whitespace-nowrap"
                      >
                        {isNull ? (
                          <span className="text-[#D85A30] italic text-[11px]">
                            null
                          </span>
                        ) : isCat ? (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{
                              background: col.isTarget ? "#E1F5EE" : "#EEEDFE",
                              color: col.isTarget ? "#085041" : "#3C3489",
                            }}
                          >
                            {String(val)}
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                            {String(val)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {dataset.rowCount > 100 && (
            <div className="px-4 py-3 text-[11px] text-[var(--text-tertiary)] border-t border-[var(--border)]">
              showing 100 of {dataset.rowCount.toLocaleString()} rows
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="h-7 border-t border-[var(--border)] flex items-center px-4 gap-3 shrink-0">
        <span className="text-[10px] text-[var(--text-tertiary)]">
          {dataset.rowCount.toLocaleString()} rows · {dataset.columns.length}{" "}
          columns · {numericCols.length} numeric
        </span>
        {dataset.targetColumn && (
          <span className="text-[10px] text-[#1D9E75]">
            target: {dataset.targetColumn} · {dataset.taskType}
          </span>
        )}
        {nullCount > 0 && (
          <span className="text-[10px] text-[#D85A30]">
            {nullCount} nulls detected
          </span>
        )}
      </div>
    </AppShell>
  );
}
