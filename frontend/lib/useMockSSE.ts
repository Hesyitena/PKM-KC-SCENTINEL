// SCENTINEL - Mock SSE Hook for Demo Mode
// Mensimulasikan Server-Sent Events dari backend dengan data berfluktuasi realistis
"use client";

import { useEffect, useRef, useCallback } from "react";
import { SensorReading } from "@/types/reading";
import {
  MOCK_LATEST_READING,
  MOCK_INITIAL_CHART_DATA,
  LIVE_INTERVAL_MS,
  generateNextReading,
} from "@/lib/mockData";

/** Delay antar data saat pengiriman batch awal (ms) */
const INIT_BATCH_DELAY_MS = 40;

interface UseMockSSEOptions {
  onReading?: (reading: SensorReading) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

/**
 * Drop-in replacement untuk useSSE — menggunakan data dummy realistis.
 * Digunakan saat NEXT_PUBLIC_DEMO_MODE=true.
 *
 * Flow:
 *  1. Kirim 30 data historis awal secara cepat (chart langsung terisi)
 *  2. Setelah selesai, terus kirim data baru setiap LIVE_INTERVAL_MS
 *     tanpa berhenti — mensimulasikan live SSE stream yang terus berjalan.
 */
export function useMockSSE({
  onReading,
  enabled = true,
}: UseMockSSEOptions = {}) {
  // Stable ref agar useEffect tidak restart tiap re-render
  const onReadingRef = useRef(onReading);
  useEffect(() => { onReadingRef.current = onReading; }, [onReading]);

  const latestRef   = useRef<SensorReading>(MOCK_LATEST_READING);
  const initTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLiveStream = useCallback(() => {
    if (liveTimerRef.current) return; // already running
    liveTimerRef.current = setInterval(() => {
      const next = generateNextReading(latestRef.current);
      latestRef.current = next;
      onReadingRef.current?.(next);
    }, LIVE_INTERVAL_MS);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // ── Phase 1: send initial batch rapidly so chart fills immediately ──
    const initialBatch = [...MOCK_INITIAL_CHART_DATA];
    let idx = 0;

    initTimerRef.current = setInterval(() => {
      if (idx < initialBatch.length) {
        const reading = initialBatch[idx];
        latestRef.current = reading;
        onReadingRef.current?.(reading);
        idx++;
      } else {
        // Done with initial batch → clear and start live stream
        if (initTimerRef.current) {
          clearInterval(initTimerRef.current);
          initTimerRef.current = null;
        }
        startLiveStream();
      }
    }, INIT_BATCH_DELAY_MS);

    return () => {
      if (initTimerRef.current) clearInterval(initTimerRef.current);
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
      initTimerRef.current = null;
      liveTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // intentionally omit startLiveStream — stable via useCallback

  return {
    disconnect: () => {
      if (liveTimerRef.current) {
        clearInterval(liveTimerRef.current);
        liveTimerRef.current = null;
      }
    },
  };
}
