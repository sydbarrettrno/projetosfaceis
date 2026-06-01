import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { ItemStatus } from "@/data/checklists";

export interface ItemState {
  status: ItemStatus;
  observation: string;
}

type StoreShape = Record<string, Record<string, ItemState>>;

const STORAGE_KEY = "portal-checklists-v1";

let state: StoreShape = load();
const listeners = new Set<() => void>();

function load(): StoreShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoreShape) : {};
  } catch {
    return {};
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useChecklistState(checklistId: string) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state[checklistId] ?? EMPTY,
    () => EMPTY,
  );

  const setStatus = useCallback(
    (itemId: string, status: ItemStatus) => {
      const current = state[checklistId] ?? {};
      const item = current[itemId] ?? { status: "unchecked", observation: "" };
      state = {
        ...state,
        [checklistId]: { ...current, [itemId]: { ...item, status } },
      };
      emit();
    },
    [checklistId],
  );

  const setObservation = useCallback(
    (itemId: string, observation: string) => {
      const current = state[checklistId] ?? {};
      const item = current[itemId] ?? { status: "unchecked", observation: "" };
      state = {
        ...state,
        [checklistId]: { ...current, [itemId]: { ...item, observation } },
      };
      emit();
    },
    [checklistId],
  );

  const reset = useCallback(() => {
    const next = { ...state };
    delete next[checklistId];
    state = next;
    emit();
  }, [checklistId]);

  return { items: snapshot, setStatus, setObservation, reset };
}

const EMPTY: Record<string, ItemState> = {};

// Hydrate after mount to avoid SSR mismatch
export function useHydrate() {
  useEffect(() => {
    const fresh = load();
    state = fresh;
    listeners.forEach((l) => l());
  }, []);
}

export function getItemState(checklistId: string, itemId: string): ItemState {
  return state[checklistId]?.[itemId] ?? { status: "unchecked", observation: "" };
}
