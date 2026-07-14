import { useCallback, useEffect, useRef, useState } from "react";
import type { DrawLine } from "../../components/sketch/ui/DrawingPadCanvas";
import type { PlacedDefect } from "../../types/defect";
import {
  getPersistedDrawingState,
  putPersistedDrawingState,
  type PersistedBackground,
} from "./drawingStorageDb";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type DrawingPersistenceRecord = {
  lines: DrawLine[];
  placedDefects: PlacedDefect[];
  background: PersistedBackground | null;
};

const EMPTY_RECORD: DrawingPersistenceRecord = { lines: [], placedDefects: [], background: null };
const SAVE_DEBOUNCE_MS = 600;

export function useDrawingPersistence(drawingId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedRecord, setLoadedRecord] = useState<DrawingPersistenceRecord | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRecordRef = useRef<DrawingPersistenceRecord | null>(null);
  const drawingIdRef = useRef(drawingId);

  useEffect(() => {
    drawingIdRef.current = drawingId;
  }, [drawingId]);

  // Relies on the caller remounting via a `key` when `drawingId` changes (as
  // DrawingPadPage does) so the useState initial values above are the reset
  // point for a new drawing, rather than re-assigning state synchronously here.
  useEffect(() => {
    let cancelled = false;
    latestRecordRef.current = null;

    getPersistedDrawingState(drawingId)
      .then((stored) => {
        if (cancelled) return;
        setLoadedRecord(
          stored
            ? { lines: stored.lines, placedDefects: stored.placedDefects, background: stored.background }
            : EMPTY_RECORD,
        );
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load saved drawing state", error);
        setLoadedRecord(EMPTY_RECORD);
        setSaveStatus("error");
        setSaveError("Could not load saved drawing. Changes will not be saved automatically.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [drawingId]);

  const flush = useCallback(() => {
    const record = latestRecordRef.current;
    if (!record) return;

    const targetDrawingId = drawingIdRef.current;
    setSaveStatus("saving");

    putPersistedDrawingState({ drawingId: targetDrawingId, ...record, updatedAt: new Date().toISOString() })
      .then(() => {
        setSaveStatus("saved");
        setSaveError(null);
      })
      .catch((error) => {
        console.error("Failed to save drawing state", error);
        setSaveStatus("error");
        setSaveError("Could not save changes. Your device storage may be full.");
      });
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        flush();
      }
    };
  }, [drawingId, flush]);

  const scheduleSave = useCallback(
    (record: DrawingPersistenceRecord) => {
      latestRecordRef.current = record;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        flush();
      }, SAVE_DEBOUNCE_MS);
    },
    [flush],
  );

  return { isLoading, loadedRecord, saveStatus, saveError, scheduleSave };
}
