"use client";

// react
import { useEffect, useRef } from "react";

// d3
import * as d3 from "d3";

// types
import { CorrelationHeatmapPropsTypes } from "@/types/types";

export default function CorrelationHeatmap({
  labels,
  matrix,
}: CorrelationHeatmapPropsTypes) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !labels.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 55, right: 10, bottom: 10, left: 75 };
    const containerW = svgRef.current.parentElement?.clientWidth ?? 400;
    const innerSize = Math.min(containerW - margin.left - margin.right, 500);
    const cellSize = innerSize / labels.length;
    const totalW = innerSize + margin.left + margin.right;
    const totalH = innerSize + margin.top + margin.bottom;

    svg.attr("viewBox", `0 0 ${totalW} ${totalH}`).attr("width", "100%");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const colorScale = d3
      .scaleSequential()
      .domain([-1, 1])
      .interpolator(
        d3.interpolateRgbBasis(["#E6F1FB", "#EEEDFE", "#7F77DD", "#26215C"]),
      );

    labels.forEach((rowLabel, ri) => {
      labels.forEach((colLabel, ci) => {
        const val = matrix[ri][ci];

        g.append("rect")
          .attr("x", ci * cellSize + 1)
          .attr("y", ri * cellSize + 1)
          .attr("width", cellSize - 3)
          .attr("height", cellSize - 3)
          .attr("rx", 4)
          .attr("fill", colorScale(val))
          .style("cursor", "pointer")
          .on("mouseenter", function (event: MouseEvent) {
            d3.select(this).attr("opacity", 0.8);
            if (tooltipRef.current) {
              tooltipRef.current.style.opacity = "1";
              tooltipRef.current.innerHTML = `<strong>${rowLabel} × ${colLabel}</strong><br/>r = ${val.toFixed(3)}`;
              tooltipRef.current.style.left = `${event.offsetX + 10}px`;
              tooltipRef.current.style.top = `${event.offsetY - 36}px`;
            }
          })
          .on("mouseleave", function () {
            d3.select(this).attr("opacity", 1);
            if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
          });

        if (cellSize > 28) {
          g.append("text")
            .attr("x", ci * cellSize + cellSize / 2)
            .attr("y", ri * cellSize + cellSize / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", Math.max(8, cellSize * 0.22))
            .attr("font-weight", "500")
            .attr("fill", Math.abs(val) > 0.5 ? "#CECBF6" : "#3C3489")
            .attr("pointer-events", "none")
            .text(val.toFixed(2));
        }
      });
    });

    // column labels
    labels.forEach((label, i) => {
      g.append("text")
        .attr("x", i * cellSize + cellSize / 2)
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("font-size", Math.min(11, cellSize * 0.35))
        .attr("fill", "var(--text-secondary)")
        .text(label.length > 10 ? label.slice(0, 9) + "…" : label);
    });

    // row labels
    labels.forEach((label, i) => {
      g.append("text")
        .attr("x", -8)
        .attr("y", i * cellSize + cellSize / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "central")
        .attr("font-size", Math.min(11, cellSize * 0.35))
        .attr("fill", "var(--text-secondary)")
        .text(label.length > 10 ? label.slice(0, 9) + "…" : label);
    });

    // color legend
    const legendW = Math.min(innerSize, 160);
    const legendG = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${totalH - 14})`);

    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "corr-grad");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#E6F1FB");
    grad.append("stop").attr("offset", "50%").attr("stop-color", "#7F77DD");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#26215C");

    legendG
      .append("rect")
      .attr("width", legendW)
      .attr("height", 5)
      .attr("rx", 2)
      .attr("fill", "url(#corr-grad)");

    legendG
      .append("text")
      .attr("x", 0)
      .attr("y", -3)
      .attr("font-size", 9)
      .attr("fill", "var(--text-tertiary)")
      .text("-1");
    legendG
      .append("text")
      .attr("x", legendW)
      .attr("y", -3)
      .attr("font-size", 9)
      .attr("fill", "var(--text-tertiary)")
      .attr("text-anchor", "end")
      .text("+1");
  }, [labels, matrix]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef} className="w-full" />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none opacity-0 transition-opacity duration-150"
        style={{
          background: "var(--bg-primary)",
          border: "0.5px solid var(--border)",
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 12,
          color: "var(--text-primary)",
          zIndex: 10,
          whiteSpace: "nowrap",
        }}
      />
    </div>
  );
}
