import "fake-indexeddb/auto";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDrawingPersistence } from "./useDrawingPersistence";

describe("useDrawingPersistence", () => {
  it("loads with an empty record when nothing has been saved for this drawingId", async () => {
    const { result } = renderHook(() => useDrawingPersistence("drawing-empty"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.loadedRecord).toEqual({ lines: [], placedDefects: [], background: null });
  });

  it("scheduleSave debounces and eventually persists, and a fresh hook instance for the same drawingId loads it back", async () => {
    const { result, unmount } = renderHook(() => useDrawingPersistence("drawing-roundtrip"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.scheduleSave({
        lines: [{ tool: "pen", color: "#000", points: [0, 0, 1, 1] }],
        placedDefects: [],
        background: null,
      });
    });

    await waitFor(() => expect(result.current.saveStatus).toBe("saved"), { timeout: 3000 });
    unmount();

    const { result: result2 } = renderHook(() => useDrawingPersistence("drawing-roundtrip"));
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    expect(result2.current.loadedRecord?.lines).toHaveLength(1);
    expect(result2.current.loadedRecord?.lines[0]).toMatchObject({ tool: "pen", color: "#000" });
  });

  it("rapid successive scheduleSave calls within the debounce window only persist the final state", async () => {
    const { result } = renderHook(() => useDrawingPersistence("drawing-debounce"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.scheduleSave({ lines: [], placedDefects: [], background: null });
    });
    act(() => {
      result.current.scheduleSave({
        lines: [{ tool: "eraser", color: "white", points: [5, 5] }],
        placedDefects: [],
        background: null,
      });
    });

    await waitFor(() => expect(result.current.saveStatus).toBe("saved"), { timeout: 3000 });

    const { result: result2 } = renderHook(() => useDrawingPersistence("drawing-debounce"));
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    expect(result2.current.loadedRecord?.lines).toHaveLength(1);
    expect(result2.current.loadedRecord?.lines[0]).toMatchObject({ tool: "eraser" });
  });

  it("flushes a pending save on unmount rather than dropping it", async () => {
    const { result, unmount } = renderHook(() => useDrawingPersistence("drawing-unmount-flush"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.scheduleSave({
        lines: [{ tool: "pen", color: "#2563eb", points: [1, 2, 3, 4] }],
        placedDefects: [],
        background: null,
      });
    });

    unmount();

    const { result: result2 } = renderHook(() => useDrawingPersistence("drawing-unmount-flush"));
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    expect(result2.current.loadedRecord?.lines).toHaveLength(1);
  });
});
