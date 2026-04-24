"use client";

// react
import { useEffect, useRef, useMemo } from "react";

// d3
import * as d3 from "d3";

// types
import { ScatterPlotPropsType } from "@/types/types";

const DEFAULT_COLORS = ["#534AB7", "#1D9E75", "#D85A30", "#378ADD", "#D4537E"];

export default function ScatterPlot({
  data,
  xLabel,
  yLabel,
  colorMap,
}: ScatterPlotPropsType) {
  // useRef
  const ref = useRef<SVGSVGElement>(null);

  // constants
  const classes = useMemo(
    () => [...new Set(data.map((d) => d.label ?? "data"))],
    [data],
  );

  const colors = useMemo(() => {
    if (colorMap) return colorMap;
    return Object.fromEntries(
      classes.map((c, i) => [c, DEFAULT_COLORS[i % DEFAULT_COLORS.length]]),
    );
  }, [classes, colorMap]);

  // useEffect
  useEffect(() => {
    if (!ref.current || !data.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const W = ref.current.parentElement?.clientWidth ?? 400;
    const H = 260;
    const m = { top: 16, right: 16, bottom: 36, left: 44 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    svg.attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.x) as [number, number])
      .nice()
      .range([0, w]);
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.y) as [number, number])
      .nice()
      .range([h, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    // Grid
    g.append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-w)
          .tickFormat(() => ""),
      )
      .select(".domain")
      .remove();
    g.selectAll(".tick line")
      .attr("stroke", "var(--border)")
      .attr("stroke-opacity", 0.4);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(6).tickSize(3))
      .call((a) => {
        a.select(".domain").attr("stroke", "var(--border)");
        a.selectAll("text")
          .attr("font-size", 10)
          .attr("fill", "var(--text-tertiary)");
        a.selectAll("line").attr("stroke", "var(--border)");
      });

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(3))
      .call((a) => {
        a.select(".domain").attr("stroke", "var(--border)");
        a.selectAll("text")
          .attr("font-size", 10)
          .attr("fill", "var(--text-tertiary)");
        a.selectAll("line").attr("stroke", "var(--border)");
      });

    // Axis labels
    g.append("text")
      .attr("x", w / 2)
      .attr("y", h + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "var(--text-secondary)")
      .text(xLabel);
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -h / 2)
      .attr("y", -34)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "var(--text-secondary)")
      .text(yLabel);

    // Dots
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4.5)
      .attr("fill", (d) => colors[d.label ?? "data"])
      .attr("opacity", 0.75)
      .attr("stroke", "none")
      .style("cursor", "pointer")
      .on("mouseenter", function (_, d) {
        d3.select(this).attr("r", 6.5).attr("opacity", 1);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 4.5).attr("opacity", 0.75);
      });
  }, [data, xLabel, yLabel, colors]);

  return (
    <div className="w-full">
      <svg ref={ref} className="w-full" />
      {classes.length > 1 && (
        <div className="flex gap-3 flex-wrap px-2 mt-1">
          {classes.map((c) => (
            <div
              key={c}
              className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]"
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: colors[c] }}
              />
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
