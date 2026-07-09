import { useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import type Konva from "konva";

type Tool = "pen" | "eraser";

type DrawLine = {
  tool: Tool;
  points: number[];
};

export default function DrawingPad() {
  const [tool, setTool] = useState<Tool>("pen");
  const [lines, setLines] = useState<DrawLine[]>([]);
  const isDrawing = useRef(false);

  const handlePointerDown = (
    e: Konva.KonvaEventObject<PointerEvent>
  ) => {
    isDrawing.current = true;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();

    if (!pos) return;

    setLines([
      ...lines,
      {
        tool,
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
                  ? "black"
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