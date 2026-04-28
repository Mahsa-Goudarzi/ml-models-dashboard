"use client";

// recharts for data visualization
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

// types
import type { LossCurvePropsType } from "@/types/types";

export default function LossCurve({ history }: LossCurvePropsType) {
  if (!history.length)
    return (
      <div className="flex items-center justify-center h-full text-[12px] text-[var(--text-tertiary)]">
        training not started
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <LineChart
        data={history}
        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          strokeOpacity={0.5}
        />
        <XAxis
          dataKey="epoch"
          tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "epoch",
            position: "insideBottom",
            offset: -2,
            fontSize: 10,
            fill: "var(--text-tertiary)",
          }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.toFixed(2)}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-primary)",
            border: "0.5px solid var(--border)",
            borderRadius: 6,
            fontSize: 11,
            color: "var(--text-primary)",
          }}
          formatter={(v: ValueType | undefined) => {
            if (typeof v === "number") {
              return v.toFixed(4);
            }
            return v ?? "";
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="loss"
          stroke="#534AB7"
          strokeWidth={1.5}
          dot={false}
          name="train loss"
        />
        <Line
          type="monotone"
          dataKey="valLoss"
          stroke="#AFA9EC"
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="4 3"
          name="val loss"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
