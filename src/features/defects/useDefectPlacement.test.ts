import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDefectPlacement } from "./useDefectPlacement";

describe("useDefectPlacement", () => {
  it("arms a defect type and disarms it when tapped again", () => {
    const { result } = renderHook(() => useDefectPlacement());

    act(() => result.current.armDefectType("crack"));
    expect(result.current.armedDefectTypeId).toBe("crack");

    act(() => result.current.armDefectType("crack"));
    expect(result.current.armedDefectTypeId).toBeNull();
  });

  it("does nothing when tapping the canvas with no armed defect type", () => {
    const { result } = renderHook(() => useDefectPlacement());

    act(() => result.current.placeDefect({ x: 10, y: 10 }));

    expect(result.current.pendingPosition).toBeNull();
    expect(result.current.placedDefects).toHaveLength(0);
  });

  it("drops a pending marker on the first tap without finalizing a defect", () => {
    const { result } = renderHook(() => useDefectPlacement());

    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 10, y: 20 }));

    expect(result.current.pendingPosition).toEqual({ x: 10, y: 20 });
    expect(result.current.placedDefects).toHaveLength(0);
  });

  it("completes the placement on the second tap, using it as the label position", () => {
    const { result } = renderHook(() => useDefectPlacement());

    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 10, y: 20 }));
    act(() => result.current.placeDefect({ x: 100, y: 200 }));

    expect(result.current.pendingPosition).toBeNull();
    expect(result.current.placedDefects).toHaveLength(1);
    expect(result.current.placedDefects[0]).toMatchObject({
      defectTypeId: "crack",
      position: { x: 10, y: 20 },
      labelPosition: { x: 100, y: 200 },
    });
  });

  it("stays armed after a completed placement so another defect can be placed immediately", () => {
    const { result } = renderHook(() => useDefectPlacement());

    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 10, y: 20 }));
    act(() => result.current.placeDefect({ x: 100, y: 200 }));

    expect(result.current.armedDefectTypeId).toBe("crack");
  });

  it("clears a pending marker when the armed type is toggled off", () => {
    const { result } = renderHook(() => useDefectPlacement());

    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 10, y: 20 }));
    act(() => result.current.armDefectType("crack"));

    expect(result.current.armedDefectTypeId).toBeNull();
    expect(result.current.pendingPosition).toBeNull();
  });

  it("clears a pending marker via cancelPending without disarming the type", () => {
    const { result } = renderHook(() => useDefectPlacement());

    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 10, y: 20 }));
    act(() => result.current.cancelPending());

    expect(result.current.pendingPosition).toBeNull();
    expect(result.current.armedDefectTypeId).toBe("crack");
  });

  it("places two distinct defects across four consecutive taps", () => {
    const { result } = renderHook(() => useDefectPlacement());

    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 1, y: 1 }));
    act(() => result.current.placeDefect({ x: 2, y: 2 }));
    act(() => result.current.placeDefect({ x: 3, y: 3 }));
    act(() => result.current.placeDefect({ x: 4, y: 4 }));

    expect(result.current.placedDefects).toHaveLength(2);
    expect(result.current.placedDefects[0]).toMatchObject({
      defectTypeId: "crack",
      position: { x: 1, y: 1 },
      labelPosition: { x: 2, y: 2 },
    });
    expect(result.current.placedDefects[1]).toMatchObject({
      defectTypeId: "crack",
      position: { x: 3, y: 3 },
      labelPosition: { x: 4, y: 4 },
    });
  });

  it("removeLastDefect removes the most recently placed defect", () => {
    const { result } = renderHook(() => useDefectPlacement());
    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 10, y: 20 }));
    act(() => result.current.placeDefect({ x: 15, y: 25 }));
    act(() => result.current.placeDefect({ x: 30, y: 40 }));
    act(() => result.current.placeDefect({ x: 35, y: 45 }));

    const firstId = result.current.placedDefects[0].id;
    act(() => result.current.removeLastDefect());

    expect(result.current.placedDefects).toHaveLength(1);
    expect(result.current.placedDefects[0].id).toBe(firstId);
  });

  it("removeLastDefect on an empty placedDefects array does not throw and leaves it empty", () => {
    const { result } = renderHook(() => useDefectPlacement());
    expect(() => act(() => result.current.removeLastDefect())).not.toThrow();
    expect(result.current.placedDefects).toEqual([]);
  });

  it("removeLastDefect removes exactly one and preserves order/identity of the rest", () => {
    const { result } = renderHook(() => useDefectPlacement());
    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 1, y: 1 }));
    act(() => result.current.placeDefect({ x: 2, y: 2 }));
    act(() => result.current.armDefectType("corrosion"));
    act(() => result.current.placeDefect({ x: 3, y: 3 }));
    act(() => result.current.placeDefect({ x: 4, y: 4 }));
    act(() => result.current.armDefectType("spalling"));
    act(() => result.current.placeDefect({ x: 5, y: 5 }));
    act(() => result.current.placeDefect({ x: 6, y: 6 }));

    const remainingIds = result.current.placedDefects.slice(0, 2).map((d) => d.id);
    act(() => result.current.removeLastDefect());

    expect(result.current.placedDefects.map((d) => d.id)).toEqual(remainingIds);
  });

  it("seeds placedDefects from an initial value passed in", () => {
    const initial = [
      { id: "a", defectTypeId: "corrosion", position: { x: 5, y: 5 }, labelPosition: { x: 6, y: 6 } },
    ];
    const { result } = renderHook(() => useDefectPlacement(initial));

    expect(result.current.placedDefects).toEqual(initial);
  });
});
