import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import type Konva from "konva";
import { Eraser, Pencil, Trash2, Undo2 } from "lucide-react";
import type { DefectType, PlacedDefect } from "../../../types/defect";
import DefectMarkerLayer from "../../../features/defects/DefectMarkerLayer";
import { Button, Card, ConfirmDialog } from "../../ui";

type Tool = "pen" | "eraser";

type DrawLine = {
  tool: Tool;
  color: string;
  points: number[];
};

type DrawingPadCanvasProps = {
  armedDefectTypeId?: string | null;
  onCanvasTap?: (position: { x: number; y: number }) => void;
  placedDefects?: PlacedDefect[];
  defectTypes?: DefectType[];
  onStrokeComplete?: () => void;
  canUndo?: boolean;
  onUndo?: () => void;
  onClearStrokes?: () => void;
};

export type DrawingPadCanvasHandle = {
  undoLastLine: () => void;
};

const CANVAS_MIN_WIDTH = 320;
const CANVAS_MIN_HEIGHT = 360;
const CANVAS_HORIZONTAL_PADDING = 32;
const CANVAS_HEIGHT_OFFSET = 220;
const CANVAS_ASPECT_HEIGHT_RATIO = 0.7;

const DRAWING_COLORS = [
  { value: "#0f172a", label: "Features" },
  { value: "#2563eb", label: "Measurements" },
  { value: "#ef4444", label: "Defects" },
] as const;

const DrawingPadCanvas = forwardRef<DrawingPadCanvasHandle, DrawingPadCanvasProps>(function DrawingPadCanvas(
  {
    armedDefectTypeId = null,
    onCanvasTap,
    placedDefects = [],
    defectTypes = [],
    onStrokeComplete,
    canUndo = false,
    onUndo,
    onClearStrokes,
  },
  ref,
) {
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>(DRAWING_COLORS[1].value);
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [stageSize, setStageSize] = useState({ width: 900, height: 600 });
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const isDrawing = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      undoLastLine: () => {
        if (isDrawing.current) return;
        setLines((prev) => prev.slice(0, -1));
      },
    }),
    [],
  );

  const handlePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();

    if (!pos) return;

    if (armedDefectTypeId) {
      onCanvasTap?.(pos);
      return;
    }

    isDrawing.current = true;

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
    if (!isDrawing.current) return;
    isDrawing.current = false;
    onStrokeComplete?.();
  };

  useEffect(() => {
    const updateStageSize = () => {
      if (!containerRef.current) return;

      const parentWidth = containerRef.current.clientWidth;
      const availableHeight = window.innerHeight - CANVAS_HEIGHT_OFFSET;
      const width = Math.max(CANVAS_MIN_WIDTH, parentWidth - CANVAS_HORIZONTAL_PADDING);
      const height = Math.max(
        CANVAS_MIN_HEIGHT,
        Math.min(availableHeight, parentWidth * CANVAS_ASPECT_HEIGHT_RATIO),
      );

      setStageSize({ width, height });
    };

    updateStageSize();
    window.addEventListener("resize", updateStageSize);

    return () => window.removeEventListener("resize", updateStageSize);
  }, []);

  return (
    <Card ref={containerRef}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" active={tool === "pen"} size="sm" icon={Pencil} onClick={() => setTool("pen")}>
            Pen
          </Button>
          <Button
            variant="ghost"
            active={tool === "eraser"}
            size="sm"
            icon={Eraser}
            onClick={() => setTool("eraser")}
          >
            Eraser
          </Button>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex flex-wrap items-center gap-2">
          {DRAWING_COLORS.map((swatch) => (
            <Button
              key={swatch.value}
              variant="ghost"
              active={color === swatch.value}
              size="sm"
              onClick={() => setColor(swatch.value)}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: swatch.value }}
                aria-hidden="true"
              />
              {swatch.label}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Undo2} onClick={onUndo} disabled={!canUndo}>
            Undo
          </Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setIsClearDialogOpen(true)}>
            Clear
          </Button>
        </div>
      </div>

      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full rounded-xl border border-slate-300"
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
          <DefectMarkerLayer placedDefects={placedDefects} defectTypes={defectTypes} />
        </Layer>
      </Stage>

      <ConfirmDialog
        open={isClearDialogOpen}
        title="Clear this drawing?"
        description="This removes every pen and eraser stroke on this drawing. Defect markers are not affected."
        confirmLabel="Clear"
        onConfirm={() => {
          setLines([]);
          onClearStrokes?.();
          setIsClearDialogOpen(false);
        }}
        onCancel={() => setIsClearDialogOpen(false)}
      />
    </Card>
  );
});

export default DrawingPadCanvas;
