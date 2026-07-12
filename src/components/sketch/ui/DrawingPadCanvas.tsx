import { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import type Konva from "konva";

type Tool = "pen" | "eraser";

type DrawLine = {
  tool: Tool;
  color: string;
  points: number[];
};

export default function DrawingPadCanvas() {
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#2563eb");
  const [lines, setLines] = useState<DrawLine[]>([]);
  const isDrawing = useRef(false);
  const palette = ["#111827", "#ef4444", "#10b981", "#2563eb", "#f59e0b", "#8b5cf6"];

  const handlePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    isDrawing.current = true;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();

    if (!pos) return;

    setLines((prevLines) => [
      ...prevLines,
      {
        tool,
        color: tool === "pen" ? color : "white",
        points: [pos.x, pos.y],
      },
    ]);
  };

  const handlePointerMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();

    if (!point) return;

    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];

      const updatedLine = {
        ...lastLine,
        points: lastLine.points.concat([point.x, point.y]),
      };

      return [...prevLines.slice(0, -1), updatedLine];
    });
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTool("pen")}
          className={`rounded-full px-3 py-2 text-sm font-semibold ${tool === "pen" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Pen
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`rounded-full px-3 py-2 text-sm font-semibold ${tool === "eraser" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Eraser
        </button>
        <button
          onClick={() => setLines([])}
          className="rounded-full bg-rose-500 px-3 py-2 text-sm font-semibold text-white"
        >
          Clear
        </button>

        <div className="ml-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Color:</span>
          {palette.map((swatch) => (
            <button
              key={swatch}
              onClick={() => setColor(swatch)}
              aria-label={`Select ${swatch}`}
              className={`h-6 w-6 rounded-full border ${color === swatch ? "border-2 border-slate-900" : "border-slate-300"}`}
              style={{ backgroundColor: swatch }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Choose drawing color"
            className="h-8 w-8 cursor-pointer rounded-full border border-slate-300 bg-transparent p-0"
          />
        </div>
      </div>

      <Stage
        width={900}
        height={600}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="rounded-xl border border-slate-300"
        style={{ border: "1px solid #cbd5e1" }}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.tool === "pen" ? line.color : "white"}
              strokeWidth={line.tool === "pen" ? 3 : 20}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
