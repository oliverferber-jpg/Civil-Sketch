import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDefectPlacement } from "./useDefectPlacement";

describe("useDefectPlacement", () => {
  it("placeDefect is a no-op when no defect type is armed", () => {
    const { result } = renderHook(() => useDefectPlacement());
    act(() => result.current.placeDefect({ x: 10, y: 20 }));
    expect(result.current.placedDefects).toEqual([]);
  });

  it("placeDefect appends a new defect with the correct labelPosition offset when armed", () => {
    const { result } = renderHook(() => useDefectPlacement());
    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 10, y: 20 }));

    expect(result.current.placedDefects).toHaveLength(1);
    const defect = result.current.placedDefects[0];
    expect(defect.defectTypeId).toBe("crack");
    expect(defect.position).toEqual({ x: 10, y: 20 });
    expect(defect.labelPosition).toEqual({ x: 50, y: -20 });
  });

  it("removeLastDefect removes the most recently placed defect", () => {
    const { result } = renderHook(() => useDefectPlacement());
    act(() => result.current.armDefectType("crack"));
    act(() => result.current.placeDefect({ x: 10, y: 20 }));
    act(() => result.current.placeDefect({ x: 30, y: 40 }));

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
    act(() => result.current.armDefectType("corrosion"));
    act(() => result.current.placeDefect({ x: 2, y: 2 }));
    act(() => result.current.armDefectType("spalling"));
    act(() => result.current.placeDefect({ x: 3, y: 3 }));

    const remainingIds = result.current.placedDefects.slice(0, 2).map((d) => d.id);
    act(() => result.current.removeLastDefect());

    expect(result.current.placedDefects.map((d) => d.id)).toEqual(remainingIds);
  });

  it("armDefectType toggles off when arming the same id twice", () => {
    const { result } = renderHook(() => useDefectPlacement());
    act(() => result.current.armDefectType("crack"));
    expect(result.current.armedDefectTypeId).toBe("crack");
    act(() => result.current.armDefectType("crack"));
    expect(result.current.armedDefectTypeId).toBeNull();
  });
});
