import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { ItemStatus } from "@/data/trilha";

export interface ItemState {
  status: ItemStatus;
  observation: string;
  value: string;
}

type StoreShape = Record<string, ItemState>;

const STORAGE_KEY = "projeto-facil-v02";
const EMPTY: ItemState = { status: "not_started", observation: "", value: "" };

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
    /* ignore */
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

function key(stageId: string, itemId: string) {
  return `${stageId}::${itemId}`;
}

export function useTrilhaState() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => ({}) as StoreShape,
  );

  const get = useCallback((stageId: string, itemId: string): ItemState => {
    return snapshot[key(stageId, itemId)] ?? EMPTY;
  }, [snapshot]);

  const setStatus = useCallback((stageId: string, itemId: string, status: ItemStatus) => {
    const k = key(stageId, itemId);
    state = { ...state, [k]: { ...(state[k] ?? EMPTY), status } };
    emit();
  }, []);

  const setObservation = useCallback((stageId: string, itemId: string, observation: string) => {
    const k = key(stageId, itemId);
    state = { ...state, [k]: { ...(state[k] ?? EMPTY), observation } };
    emit();
  }, []);

  const setValue = useCallback((stageId: string, itemId: string, value: string) => {
    const k = key(stageId, itemId);
    state = { ...state, [k]: { ...(state[k] ?? EMPTY), value } };
    emit();
  }, []);

  const reset = useCallback(() => {
    state = {};
    emit();
  }, []);

  return { snapshot, get, setStatus, setObservation, setValue, reset };
}

export function useHydrate() {
  useEffect(() => {
    const fresh = load();
    state = fresh;
    listeners.forEach((l) => l());
  }, []);
}
