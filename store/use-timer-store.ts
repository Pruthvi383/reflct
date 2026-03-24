import { create } from "zustand";

type TimerPhase = "idle" | "running" | "paused" | "complete";

type TimerState = {
  phase: TimerPhase;
  duration: number;
  remaining: number;
  label: string;
  startedAt: string | null;
  setLabel: (label: string) => void;
  setDuration: (minutes: number) => void;
  start: () => void;
  tick: () => void;
  pause: () => void;
  reset: () => void;
  complete: () => void;
};

const defaultDuration = 25 * 60;

export const useTimerStore = create<TimerState>((set, get) => ({
  phase: "idle",
  duration: defaultDuration,
  remaining: defaultDuration,
  label: "",
  startedAt: null,
  setLabel: (label) => set({ label }),
  setDuration: (minutes) => set({ duration: minutes * 60, remaining: minutes * 60 }),
  start: () =>
    set({
      phase: "running",
      startedAt: get().startedAt ?? new Date().toISOString()
    }),
  tick: () => {
    const remaining = get().remaining;
    if (remaining <= 1) {
      set({ remaining: 0, phase: "complete" });
      return;
    }
    set({ remaining: remaining - 1 });
  },
  pause: () => set({ phase: "paused" }),
  reset: () =>
    set((state) => ({
      phase: "idle",
      remaining: state.duration,
      startedAt: null
    })),
  complete: () => set({ phase: "complete" })
}));
