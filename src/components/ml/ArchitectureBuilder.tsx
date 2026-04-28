"use client";
// state management
import { useTrainingStore } from "@/core/store/trainingStore";

// icons
import { Plus, Trash2 } from "lucide-react";

// types
import type { LayerConfig, Activation } from "@/types/types";

// constants
import { ACTIVATIONS, TASKS } from "@/const/const";
import { useDatasetStore } from "@/core/store/datasetStore";

export default function ArchitectureBuilder() {
  // state management
  const { config, setConfig } = useTrainingStore();
  const isRegression = useDatasetStore(
    (s) => s.dataset?.taskType === TASKS.Regression,
  );

  const addLayer = () => {
    setConfig({
      layers: [
        ...config.layers,
        { id: `h${Date.now()}`, units: 8, activation: ACTIVATIONS.ReLU },
      ],
    });
  };

  const removeLayer = (id: string) => {
    setConfig({ layers: config.layers.filter((l) => l.id !== id) });
  };

  const updateLayer = (id: string, updates: Partial<LayerConfig>) => {
    setConfig({
      layers: config.layers.map((l) =>
        l.id === id ? { ...l, ...updates } : l,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Input layer (static) */}
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium"
        style={{
          background: "#E6F1FB",
          color: "#0C447C",
          border: "1.5px solid #378ADD",
        }}
      >
        input · auto-detected
      </div>

      {/* Hidden layers */}
      {config.layers.map((layer) => (
        <div
          key={layer.id}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium"
          style={{ background: "#EEEDFE", border: "0.5px solid #7F77DD" }}
        >
          <span className="text-[#3C3489] shrink-0">dense</span>
          <input
            type="number"
            min={1}
            max={256}
            value={layer.units}
            onChange={(e) =>
              updateLayer(layer.id, { units: parseInt(e.target.value) || 1 })
            }
            className="w-12 text-center text-[#3C3489] bg-white/60 border border-[#AFA9EC] rounded px-1 py-0.5 text-[10px]"
          />
          <select
            value={layer.activation}
            onChange={(e) =>
              updateLayer(layer.id, {
                activation: e.target.value as Activation,
              })
            }
            className="flex-1 text-[#3C3489] bg-white/60 border border-[#AFA9EC] rounded px-1 py-0.5 text-[10px]"
          >
            {Object.values(ACTIVATIONS).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          {config.layers.length > 1 && (
            <button
              onClick={() => removeLayer(layer.id)}
              className="text-[#AFA9EC] hover:text-[#D85A30] cursor-pointer"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addLayer}
        className="flex items-center justify-center gap-1 py-1.5 text-[11px] text-[#7F77DD] border border-dashed border-[#7F77DD] rounded-md hover:bg-[#EEEDFE] transition-colors cursor-pointer"
      >
        <Plus size={12} /> add layer
      </button>

      {/* Output (static) */}
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium"
        style={{
          background: "#E1F5EE",
          color: "#085041",
          border: "1.5px solid #1D9E75",
        }}
      >
        output · {isRegression ? ACTIVATIONS.Linear : ACTIVATIONS.Softmax} ·
        auto
      </div>
    </div>
  );
}
