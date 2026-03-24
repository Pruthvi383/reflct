"use client";

import { useEffect, useRef } from "react";

export function useAutosave(callback: () => void | Promise<void>, delay: number) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void callbackRef.current();
    }, delay);

    return () => window.clearInterval(interval);
  }, [delay]);
}
