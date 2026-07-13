import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useUndoHistory } from "./useUndoHistory";

describe("useUndoHistory", () => {
  it("canUndo is false initially", () => {
    const { result } = renderHook(() => useUndoHistory());
    expect(result.current.canUndo).toBe(false);
  });

  it("push stroke then defect: peekLast returns the most recently pushed type", () => {
    const { result } = renderHook(() => useUndoHistory());
    act(() => result.current.pushStroke());
    act(() => result.current.pushDefect());
    expect(result.current.peekLast()).toBe("defect");
  });

  it("popLast removes entries in LIFO order", () => {
    const { result } = renderHook(() => useUndoHistory());
    act(() => result.current.pushStroke());
    act(() => result.current.pushDefect());
    act(() => result.current.popLast());
    expect(result.current.peekLast()).toBe("stroke");
  });

  it("popLast on empty history is a no-op and does not throw", () => {
    const { result } = renderHook(() => useUndoHistory());
    expect(() => act(() => result.current.popLast())).not.toThrow();
    expect(result.current.peekLast()).toBeUndefined();
    expect(result.current.canUndo).toBe(false);
  });

  it("canUndo becomes false after popping the only entry", () => {
    const { result } = renderHook(() => useUndoHistory());
    act(() => result.current.pushStroke());
    expect(result.current.canUndo).toBe(true);
    act(() => result.current.popLast());
    expect(result.current.canUndo).toBe(false);
  });

  it("removeAllOfType removes only entries of that type and preserves order of the rest", () => {
    const { result } = renderHook(() => useUndoHistory());
    act(() => result.current.pushStroke());
    act(() => result.current.pushDefect());
    act(() => result.current.pushStroke());
    act(() => result.current.pushDefect());
    act(() => result.current.removeAllOfType("stroke"));
    expect(result.current.history).toEqual(["defect", "defect"]);
  });

  it("removeAllOfType on empty history is a no-op", () => {
    const { result } = renderHook(() => useUndoHistory());
    expect(() => act(() => result.current.removeAllOfType("stroke"))).not.toThrow();
    expect(result.current.history).toEqual([]);
  });

  it("interleaved push/pop sequence resolves correctly", () => {
    const { result } = renderHook(() => useUndoHistory());
    act(() => result.current.pushStroke());
    act(() => result.current.pushDefect());
    act(() => result.current.pushStroke());
    act(() => result.current.popLast());
    expect(result.current.peekLast()).toBe("defect");
    act(() => result.current.popLast());
    expect(result.current.peekLast()).toBe("stroke");
  });
});
