import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import { Eraser, FileUp, Pencil, Trash2, Undo2, X } from "lucide-react";
import type { DefectType, PlacedDefect } from "../../../types/defect";
import DefectMarkerLayer from "../../../features/defects/DefectMarkerLayer";
import DefectTypeDropdown from "../../../features/defects/DefectTypeDropdown";
import { Button, Card, ConfirmDialog } from "../../ui";

//Creates the Canvas for the drawing pad as well as the features for actually drawing

type Tool = "pen" | "eraser" | null;

export type DrawLine = {
  tool: Tool;
  color: string;
  points: number[];
};

export type DrawingBackground = { blob: Blob; name: string };

type DrawingPadCanvasProps = {
  lines: DrawLine[];
  onLinesChange: Dispatch<SetStateAction<DrawLine[]>>;
  background: DrawingBackground | null;
  onBackgroundChange: (background: DrawingBackground | null) => void;
  armedDefectTypeId?: string | null;
  onCanvasTap?: (position: { x: number; y: number }) => void;
  placedDefects?: PlacedDefect[];
  defectTypes?: DefectType[];
  pendingPosition?: { x: number; y: number } | null;
  onCancelPending?: () => void;
  onStrokeComplete?: () => void;
  canUndo?: boolean;
  onUndo?: () => void;
  onClearStrokes?: () => void;
  onToolSelect?: (tool: "pen" | "eraser") => void;
  onArmDefectType: (id: string) => void;
  onAddType: (name: string, color: string) => void;
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
  { value: "#0f172a"},
  { value: "#2563eb"},
  { value: "#ef4444"},
  { value: "#0f172a"},
  { value: "#2563eb"},
  { value: "#ef4444"},
] as const;

const DrawingPadCanvas = forwardRef<DrawingPadCanvasHandle, DrawingPadCanvasProps>(function DrawingPadCanvas(
  {
    lines,
    onLinesChange,
    background,
    onBackgroundChange,
    armedDefectTypeId = null,
    onCanvasTap,
    placedDefects = [],
    defectTypes = [],
    pendingPosition = null,
    onCancelPending,
    onStrokeComplete,
    canUndo = false,
    onUndo,
    onClearStrokes,
    onToolSelect,
    onArmDefectType,
    onAddType,
  },
  ref,
) {
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>(DRAWING_COLORS[1].value);
  const [stageSize, setStageSize] = useState({ width: 900, height: 600 });
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [derivedBackgroundImage, setDerivedBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);
  const isDrawing = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const backgroundPlacement = useMemo(() => {
    if (!derivedBackgroundImage) return null;

    const widthRatio = stageSize.width / derivedBackgroundImage.width;
    const heightRatio = stageSize.height / derivedBackgroundImage.height;
    const scale = Math.min(widthRatio, heightRatio);
    const width = derivedBackgroundImage.width * scale;
    const height = derivedBackgroundImage.height * scale;

    return {
      x: (stageSize.width - width) / 2,
      y: (stageSize.height - height) / 2,
      width,
      height,
    };
  }, [derivedBackgroundImage, stageSize.height, stageSize.width]);

  useEffect(() => {
    if (!background) {
      setDerivedBackgroundImage(null);
      return;
    }

    let cancelled = false;
    const objectUrl = URL.createObjectURL(background.blob);
    const image = new window.Image();

    image.onload = () => {
      if (!cancelled) setDerivedBackgroundImage(image);
    };
    image.onerror = () => {
      if (!cancelled) setBackgroundError("Could not render the saved background image.");
    };
    image.src = objectUrl;

    return () => {
      cancelled = true;
      URL.revokeObjectURL(objectUrl);
    };
  }, [background]);

  useImperativeHandle(
    ref,
    () => ({
      undoLastLine: () => {
        if (isDrawing.current) return;
        onLinesChange((prev) => prev.slice(0, -1));
      },
    }),
    [onLinesChange],
  );

  const handlePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();

    if (!pos) return;

    if (armedDefectTypeId) {
      onCanvasTap?.(pos);
      return;
    }

    if (!tool) return;

    isDrawing.current = true;

    onLinesChange((prev) => [
      ...prev,
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

    onLinesChange((prev) => {
      const lastLine = prev[prev.length - 1];
      if (!lastLine) return prev;

      const updatedLine = {
        ...lastLine,
        points: lastLine.points.concat([point.x, point.y]),
      };

      return [...prev.slice(0, -1), updatedLine];
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

  useEffect(() => {
    if (armedDefectTypeId) {
      setTool(null);
    }
  }, [armedDefectTypeId]);

  useEffect(() => {
    if (!armedDefectTypeId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancelPending?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [armedDefectTypeId, onCancelPending]);

  const handlePdfSelection = async (file: File | null) => {
    if (!file) return;

    setIsBackgroundLoading(true);
    setBackgroundError(null);

    try {
      const [pdfModule, workerModule] = await Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs?url")]);
      const { GlobalWorkerOptions, getDocument } = pdfModule;

      if (!GlobalWorkerOptions.workerSrc) {
        GlobalWorkerOptions.workerSrc = workerModule.default;
      }

      const data = await file.arrayBuffer();
      const loadingTask = getDocument({ data });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const baseViewport = page.getViewport({ scale: 1 });
      const maxEdge = Math.max(baseViewport.width, baseViewport.height);
      const targetEdge = 2200;
      const renderScale = Math.max(1, Math.min(2.5, targetEdge / maxEdge));
      const viewport = page.getViewport({ scale: renderScale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not initialize canvas context for PDF rendering.");
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({ canvasContext: context, viewport, canvas }).promise;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Could not encode rendered PDF image."));
        }, "image/png");
      });

      onBackgroundChange({ blob, name: file.name });
      if (typeof (pdf as unknown as { destroy?: () => void }).destroy === "function") {
        (pdf as unknown as { destroy?: () => void }).destroy?.();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load PDF.";
      setBackgroundError(message);
    } finally {
      setIsBackgroundLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearBackground = () => {
    onBackgroundChange(null);
    setBackgroundError(null);
  };

  return (
    <Card ref={containerRef}>
      <div className="mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              active={tool === "pen"}
              size="sm"
              icon={Pencil}
              onClick={() => {
                setTool("pen");
                onToolSelect?.("pen");
              }}
            >
              Pen
            </Button>
            <Button
              variant="ghost"
              active={tool === "eraser"}
              size="sm"
              icon={Eraser}
              onClick={() => {
                setTool("eraser");
                onToolSelect?.("eraser");
              }}
            >
              Eraser
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              void handlePdfSelection(selectedFile);
            }}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={FileUp}
              onClick={() => fileInputRef.current?.click()}
              disabled={isBackgroundLoading}
            >
              {isBackgroundLoading ? "Loading PDF..." : background ? "Replace PDF" : "Upload PDF"}
            </Button>
            <div className="min-w-[220px] flex-1">
              <DefectTypeDropdown
                defectTypes={defectTypes}
                armedDefectTypeId={armedDefectTypeId}
                onArmDefectType={onArmDefectType}
                onAddType={onAddType}
              />
            </div>
            {background ? (
              <Button variant="ghost-danger" size="sm" icon={X} onClick={clearBackground}>
                Remove PDF
              </Button>
            ) : null}
            {background?.name ? (
              <span className="max-w-64 truncate text-xs font-medium text-slate-500" title={background.name}>
                {background.name}
              </span>
            ) : null}
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

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {DRAWING_COLORS.map((swatch) => (
            <Button
              key={swatch.value}
              variant="ghost"
              active={color === swatch.value}
              size="sm"
              className={`rounded-xl border-2 transition-all duration-150 ease-out ${
                color === swatch.value
                  ? "h-[3.25rem] w-[3.25rem] border-slate-900"
                  : "h-10 w-10 border-transparent"
              }`}
              style={{ backgroundColor: swatch.value }}
              aria-label={`Select ${swatch.value} drawing color`}
              onClick={() => setColor(swatch.value)}
            />
            />
          ))}
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
        <Layer listening={false}>
          {derivedBackgroundImage && backgroundPlacement ? (
            <KonvaImage
              image={derivedBackgroundImage}
              x={backgroundPlacement.x}
              y={backgroundPlacement.y}
              width={backgroundPlacement.width}
              height={backgroundPlacement.height}
            />
          ) : null}
        </Layer>

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

        <Layer>
          <DefectMarkerLayer
            placedDefects={placedDefects}
            defectTypes={defectTypes}
            pendingPosition={pendingPosition}
            armedDefectTypeId={armedDefectTypeId}
          />
        </Layer>
      </Stage>

      {backgroundError ? <p className="mt-2 text-sm text-rose-600">{backgroundError}</p> : null}

      <ConfirmDialog
        open={isClearDialogOpen}
        title="Clear this drawing?"
        description="This removes every pen and eraser stroke on this drawing. Defect markers are not affected."
        confirmLabel="Clear"
        onConfirm={() => {
          onLinesChange([]);
          onClearStrokes?.();
          setIsClearDialogOpen(false);
        }}
        onCancel={() => setIsClearDialogOpen(false)}
      />
    </Card>
  );
});

export default DrawingPadCanvas;
