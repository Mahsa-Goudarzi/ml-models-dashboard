"use client";

// react
import { useEffect, useRef } from "react";

// d3
import * as d3 from "d3";

// types
import { RocCurvePropsType } from "@/types/types";

const COLORS = ["#534AB7", "#1D9E75", "#D85A30", "#378ADD"];

export default function RocCurve({ data, classNames }: RocCurvePropsType) {
  // ref for the svg element
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const W = ref.current.parentElement?.clientWidth ?? 300;
    const H = Math.min(W, 240);
    const m = { top: 16, right: 16, bottom: 36, left: 44 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    svg.attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");

    const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 1]).range([h, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    // Random line
    g.append("line")
      .attr("x1", 0)
      .attr("y1", h)
      .attr("x2", w)
      .attr("y2", 0)
      .attr("stroke", "var(--border)")
      .attr("stroke-dasharray", "4 3")
      .attr("stroke-width", 0.8);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(3))
      .call((a) => {
        a.select(".domain").attr("stroke", "var(--border)");
        a.selectAll("text")
          .attr("font-size", 10)
          .attr("fill", "var(--text-tertiary)");
      });
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(3))
      .call((a) => {
        a.select(".domain").attr("stroke", "var(--border)");
        a.selectAll("text")
          .attr("font-size", 10)
          .attr("fill", "var(--text-tertiary)");
      });

    // Labels
    g.append("text")
      .attr("x", w / 2)
      .attr("y", h + 28)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "var(--text-tertiary)")
      .text("FPR (1 - specificity)");
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -h / 2)
      .attr("y", -32)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "var(--text-tertiary)")
      .text("TPR (sensitivity)");

    // ROC curves
    const line = d3
      .line<[number, number]>()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))
      .curve(d3.curveLinear);

    data.forEach((cls, i) => {
      const points: [number, number][] = cls.fpr.map((f, j) => [f, cls.tpr[j]]);
      g.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", COLORS[i % COLORS.length])
        .attr("stroke-width", 1.8)
        .attr("d", line);
    });

    // Legend
    const leg = g.append("g").attr("transform", `translate(${w * 0.5}, 8)`);
    data.forEach((cls, i) => {
      leg
        .append("circle")
        .attr("cx", 0)
        .attr("cy", i * 16)
        .attr("r", 3.5)
        .attr("fill", COLORS[i % COLORS.length]);
      leg
        .append("text")
        .attr("x", 8)
        .attr("y", i * 16)
        .attr("dominant-baseline", "central")
        .attr("font-size", 10)
        .attr("fill", COLORS[i % COLORS.length])
        .text(`${classNames[i]} (AUC ${cls.auc.toFixed(2)})`);
    });
  }, [data, classNames]);

  return <svg ref={ref} className="w-full" />;
}
