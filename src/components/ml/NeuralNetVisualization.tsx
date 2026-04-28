"use client";

// react
import { useMemo, useEffect, useRef } from "react";

// app scope states management
import { useTrainingStore } from "@/core/store/trainingStore";
import { useDatasetStore } from "@/core/store/datasetStore";

// types
import { LayerVizType } from "@/types/types";

// utils
import { getNumberOfAllFeatures, getVisibleNeurons } from "@/utils/utils";

// constants
import { TASKS, TRAINING_STATUS } from "@/const/const";

const ELLIPSIS_THRESHOLD = 8; // if neurons exceed this, show ellipsis

export default function NeuralNetVisualization({
  classes = "",
}: {
  classes?: string;
}) {
  // app-wide states
  const dataset = useDatasetStore((s) => s.dataset);
  const { config, history } = useTrainingStore();

  // useRef
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // network constants
  const layers: LayerVizType[] = useMemo(() => {
    if (!dataset) return [];

    const inputN = getNumberOfAllFeatures(dataset);

    const isRegression = dataset?.taskType === TASKS.Regression;

    const outputN = isRegression
      ? 1
      : dataset
        ? new Set(
            dataset.rows.map((r) => String(r[dataset.targetColumn ?? ""])),
          ).size
        : 3;

    const outputLabel = dataset?.targetColumn ?? "output";

    return [
      {
        neurons: inputN,
        color: "#E6F1FB",
        strokeColor: "#378ADD",
        label: "input",
      },
      ...config.layers.map((l, i) => ({
        neurons: l.units,
        color: i === 0 ? "#EEEDFE" : "#EEEDFE",
        strokeColor: i === 0 ? "#7F77DD" : "#534AB7",
        label: `hidden ${i + 1}`,
      })),
      {
        neurons: outputN,
        color: "#E1F5EE",
        strokeColor: "#1D9E75",
        label:
          outputLabel.length > 10 ? outputLabel.slice(0, 9) + "…" : outputLabel,
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

      // connections
      layers.forEach((_, li) => {
        if (li === layers.length - 1) return;
        const { indices: fromIndices } = getVisibleNeurons(
          layers[li].neurons,
          ELLIPSIS_THRESHOLD,
        );
        const { indices: toIndices } = getVisibleNeurons(
          layers[li + 1].neurons,
          ELLIPSIS_THRESHOLD,
        );

        // calculate y positions considering ellipsis
        const getSlotY = (
          layerIdx: number,
          slotIdx: number,
          hasEllipsis: boolean,
        ) => {
          const visibleCount =
            getVisibleNeurons(layers[layerIdx].neurons, ELLIPSIS_THRESHOLD)
              .indices.length + (hasEllipsis ? 1 : 0);
          const sp = drawH / (visibleCount + 1);
          return paddingTop + sp * (slotIdx + 1);
        };

        const fromInfo = getVisibleNeurons(
          layers[li].neurons,
          ELLIPSIS_THRESHOLD,
        );
        const toInfo = getVisibleNeurons(
          layers[li + 1].neurons,
          ELLIPSIS_THRESHOLD,
        );

        fromIndices.forEach((_, fromSlot) => {
          const slot =
            fromInfo.hasEllipsis && fromSlot >= fromInfo.ellipsisAfter + 1
              ? fromSlot + 1
              : fromSlot;
          const fy = getSlotY(li, slot, fromInfo.hasEllipsis);

          toIndices.forEach((_, toSlot) => {
            const tSlot =
              toInfo.hasEllipsis && toSlot >= toInfo.ellipsisAfter + 1
                ? toSlot + 1
                : toSlot;
            const ty = getSlotY(li + 1, tSlot, toInfo.hasEllipsis);

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
        const { indices, hasEllipsis, ellipsisAfter } = getVisibleNeurons(
          layer.neurons,
          ELLIPSIS_THRESHOLD,
        );
        const visibleCount = indices.length + (hasEllipsis ? 1 : 0); // one extra slot for ellipsis if needed
        const spacing = drawH / (visibleCount + 1);

        const getY = (slotIndex: number) =>
          paddingTop + spacing * (slotIndex + 1);

        indices.forEach((neuronIdx, slotIdx) => {
          // if ellipsis is present and this neuron is after the ellipsis point, shift it down by one slot
          const slot =
            hasEllipsis && slotIdx >= ellipsisAfter + 1 ? slotIdx + 1 : slotIdx;
          const y = getY(slot);

          const pulse = lastMetrics
            ? Math.sin(Date.now() / 400 + li * 1.2 + neuronIdx * 0.8) * 0.15 +
              0.85
            : 1;

          ctx.beginPath();
          ctx.arc(layerX[li], y, radius, 0, Math.PI * 2);
          ctx.fillStyle = layer.color;
          ctx.fill();
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineWidth = 1.5 * pulse;
          ctx.stroke();
        });

        // draw ellipsis
        if (hasEllipsis) {
          const ellipsisY = getY(ellipsisAfter + 1);
          ctx.fillStyle = layer.strokeColor;
          ctx.globalAlpha = 0.5;
          for (let d = -1; d <= 1; d++) {
            ctx.beginPath();
            ctx.arc(
              layerX[li],
              ellipsisY + d * radius * 1.2,
              radius * 0.25,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }

        // label
        ctx.fillStyle = "rgba(136,135,128,0.8)";
        ctx.font = `${Math.max(9, radius * 0.85)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(
          layer.neurons > ELLIPSIS_THRESHOLD
            ? `${layer.label} (${layer.neurons})`
            : layer.label,
          layerX[li],
          H - 4,
        );
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
    if (status === TRAINING_STATUS.Training) {
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
