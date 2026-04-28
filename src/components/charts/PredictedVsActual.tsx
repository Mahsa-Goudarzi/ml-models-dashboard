"use client";

// react
import { useEffect, useRef } from "react";

// d3
import * as d3 from "d3";

// types
import { PredictedVsActualPropsTypes } from "@/types/types";

export default function PredictedVsActual({
  predictions,
}: PredictedVsActualPropsTypes) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !predictions.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const data = predictions
      .map((p) => ({
        actual: Number(p.actual),
        predicted: Number(p.predicted),
      }))
      .filter((d) => !isNaN(d.actual) && !isNaN(d.predicted));

    const W = ref.current.parentElement?.clientWidth ?? 400;
    const H = Math.min(W, 320);
    const m = { top: 16, right: 16, bottom: 44, left: 52 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    svg.attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");

    const allVals = [
      ...data.map((d) => d.actual),
      ...data.map((d) => d.predicted),
    ];
    const extent = d3.extent(allVals) as [number, number];
    const padding = (extent[1] - extent[0]) * 0.05;

    const x = d3
      .scaleLinear()
      .domain([extent[0] - padding, extent[1] + padding])
      .range([0, w]);
    const y = d3
      .scaleLinear()
      .domain([extent[0] - padding, extent[1] + padding])
      .range([h, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    // grid
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-w)
          .tickFormat(() => ""),
      )
      .call((a) => {
        a.select(".domain").remove();
        a.selectAll("line")
          .attr("stroke", "var(--border)")
          .attr("stroke-opacity", 0.5);
      });

    // perfect prediction line
    g.append("line")
      .attr("x1", x(extent[0] - padding))
      .attr("y1", y(extent[0] - padding))
      .attr("x2", x(extent[1] + padding))
      .attr("y2", y(extent[1] + padding))
      .attr("stroke", "#1D9E75")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 4")
      .attr("opacity", 0.6);

    // axes
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(3))
      .call((a) => {
        a.select(".domain").attr("stroke", "var(--border)");
        a.selectAll("text")
          .attr("font-size", 10)
          .attr("fill", "var(--text-tertiary)");
        a.selectAll("line").attr("stroke", "var(--border)");
      });

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(3))
      .call((a) => {
        a.select(".domain").attr("stroke", "var(--border)");
        a.selectAll("text")
          .attr("font-size", 10)
          .attr("fill", "var(--text-tertiary)");
        a.selectAll("line").attr("stroke", "var(--border)");
      });

    // axis labels
    g.append("text")
      .attr("x", w / 2)
      .attr("y", h + 34)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "var(--text-secondary)")
      .text("actual");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -h / 2)
      .attr("y", -38)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "var(--text-secondary)")
      .text("predicted");

    // tooltip
    const tooltip = d3
      .select(ref.current.parentElement)
      .append("div")
      .style("position", "absolute")
      .style("background", "var(--bg-primary)")
      .style("border", "0.5px solid var(--border)")
      .style("border-radius", "6px")
      .style("padding", "6px 10px")
      .style("font-size", "11px")
      .style("color", "var(--text-primary)")
      .style("pointer-events", "none")
      .style("opacity", "0")
      .style("z-index", "10")
      .style("white-space", "nowrap");

    // dots
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.actual))
      .attr("cy", (d) => y(d.predicted))
      .attr("r", 4)
      .attr("fill", (d) => {
        const err = Math.abs(d.predicted - d.actual) / (extent[1] - extent[0]);
        return err < 0.05 ? "#1D9E75" : err < 0.15 ? "#534AB7" : "#D85A30";
      })
      .attr("opacity", 0.7)
      .attr("stroke", "none")
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("r", 6).attr("opacity", 1);
        tooltip
          .style("opacity", "1")
          .html(
            `actual: <strong>${d.actual.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong><br/>predicted: <strong>${d.predicted.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>`,
          )
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 40}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 4).attr("opacity", 0.7);
        tooltip.style("opacity", "0");
      });

    // legend
    const leg = g.append("g").attr("transform", `translate(${w - 120}, 0)`);
    [
      { color: "#1D9E75", label: "error < 5%" },
      { color: "#534AB7", label: "error < 15%" },
      { color: "#D85A30", label: "error > 15%" },
    ].forEach(({ color, label }, i) => {
      leg
        .append("circle")
        .attr("cx", 0)
        .attr("cy", i * 16)
        .attr("r", 4)
        .attr("fill", color);
      leg
        .append("text")
        .attr("x", 10)
        .attr("y", i * 16)
        .attr("dominant-baseline", "central")
        .attr("font-size", 10)
        .attr("fill", "var(--text-tertiary)")
        .text(label);
    });

    return () => {
      tooltip.remove();
    };
  }, [predictions]);

  return (
    <div className="relative w-full h-full">
      <svg ref={ref} className="w-full" />
    </div>
  );
}
