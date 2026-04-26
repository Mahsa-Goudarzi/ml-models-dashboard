"use client";

// react
import { useMemo, useEffect, useRef } from "react";

// app scope states management
import { useTrainingStore } from "@/core/store/trainingStore";
import { useDatasetStore } from "@/core/store/datasetStore";

// types
import { LayerVizType } from "@/types/types";

export default function NeuralNetVisualization({
  classes = "",
}: {
  classes?: string;
}) {
  // app-wide states
  const dataset = useDatasetStore((s) => s.dataset);
  const config = useTrainingStore((s) => s.config);
  const history = useTrainingStore((s) => s.history);

  // useRef
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // network constants
  const layers: LayerVizType[] = useMemo(() => {
    const inputN =
      dataset?.columns.filter(
        (c) => !c.isTarget && !c.isIdentifier && c.type === "numeric",
      ).length ?? 4;
    const outputN = dataset
      ? new Set(dataset.rows.map((r) => String(r[dataset.targetColumn ?? ""])))
          .size
      : 3;

    return [
      {
        neurons: Math.min(inputN, 6),
        color: "#E6F1FB",
        strokeColor: "#378ADD",
        label: "input",
      },
      ...config.layers.map((l, i) => ({
        neurons: Math.min(l.units, 8),
        color: i === 0 ? "#EEEDFE" : "#EEEDFE",
        strokeColor: i === 0 ? "#7F77DD" : "#534AB7",
        label: `hidden ${i + 1}`,
      })),
      {
        neurons: Math.min(outputN, 6),
        color: "#E1F5EE",
        strokeColor: "#1D9E75",
        label: "output",
      },
    ];
  }, [config.layers, dataset]);

  const lastMetrics = history.at(-1);
  const activity = lastMetrics
    ? Math.min(lastMetrics.accuracy ?? 50, 100) / 100
    : 0.5;

  // canvas useEffect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const W = rect.width;
      const H = rect.height;

      const radius = Math.min(W / layers.length, H) * 0.07;
      const labelHeight = 20;
      const paddingTop = radius + 8;
      const drawH = H - labelHeight - paddingTop;

      ctx.clearRect(0, 0, W, H);

      const layerX = layers.map((_, i) => (W / (layers.length + 1)) * (i + 1));

      const neuronY = (layerIdx: number) => {
        const n = layers[layerIdx].neurons;
        const spacing = drawH / (n + 1);
        return Array.from(
          { length: n },
          (_, i) => paddingTop + spacing * (i + 1),
        );
      };

      // connections
      layers.forEach((_, li) => {
        if (li === layers.length - 1) return;
        neuronY(li).forEach((fy) => {
          neuronY(li + 1).forEach((ty) => {
            ctx.beginPath();
            ctx.moveTo(layerX[li], fy);
            ctx.lineTo(layerX[li + 1], ty);
            ctx.strokeStyle = `rgba(127, 119, 221, ${0.06 + activity * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          });
        });
      });

      // neurons
      layers.forEach((layer, li) => {
        neuronY(li).forEach((y, ni) => {
          const pulse = lastMetrics
            ? Math.sin(Date.now() / 400 + li * 1.2 + ni * 0.8) * 0.15 + 0.85
            : 1;
          ctx.beginPath();
          ctx.arc(layerX[li], y, radius, 0, Math.PI * 2);
          ctx.fillStyle = layer.color;
          ctx.fill();
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineWidth = 1.5 * pulse;
          ctx.stroke();
        });

        ctx.fillStyle = "rgba(136,135,128,0.8)";
        ctx.font = `${Math.max(9, radius * 0.85)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(layer.label, layerX[li], H - 4);
      });
    };

    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    draw();

    return () => ro.disconnect();
  }, [layers, lastMetrics, activity]);

  // Animate when training
  const animRef = useRef<number>(null);
  useEffect(() => {
    const status = useTrainingStore.getState().status;
    if (status === "training") {
      const tick = () => {
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [history]);

  return <canvas ref={canvasRef} className={`w-full h-full ${classes}`} />;
}
