import { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import type Konva from "konva";

type Tool = "pen" | "eraser";

type DrawLine = {
  tool: Tool;
  color: string;
  points: number[];
};

export default function DrawingPad() {
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#2563eb");
  const [lines, setLines] = useState<DrawLine[]>([]);
  const isDrawing = useRef(false);
  const palette = ["#111827", "#ef4444", "#10b981", "#2563eb", "#f59e0b", "#8b5cf6"];

  const handlePointerDown = (
    e: Konva.KonvaEventObject<PointerEvent>
  ) => {
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

  const handlePointerMove = (
    e: Konva.KonvaEventObject<PointerEvent>
  ) => {
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

      return [
        ...prevLines.slice(0, -1),
        updatedLine,
      ];
    });
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  return (
    <div>
      <div style={{ marginBottom: "12px" }}>
        <button onClick={() => setTool("pen")}>
          Pen
        </button>

        <button onClick={() => setTool("eraser")}>
          Eraser
        </button>

        <button onClick={() => setLines([])}>
          Clear
        </button>

        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600 }}>Color:</span>
          {palette.map((swatch) => (
            <button
              key={swatch}
              onClick={() => setColor(swatch)}
              aria-label={`Select ${swatch}`}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "999px",
                border: color === swatch ? "2px solid #111827" : "1px solid #d1d5db",
                background: swatch,
                cursor: "pointer",
              }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Choose drawing color"
          />
        </div>
      </div>

      <Stage
        width={900}
        height={600}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          border: "1px solid black",
        }}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={
                line.tool === "pen"
                  ? line.color
                  : "white"
              }
              strokeWidth={
                line.tool === "pen"
                  ? 3
                  : 20
              }
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser"
                  ? "destination-out"
                  : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}