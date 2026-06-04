// SCENTINEL - Mock SSE Hook for Demo Mode
// Mensimulasikan Server-Sent Events dari backend dengan data berfluktuasi
"use client";

import { useEffect, useRef } from "react";
import { SensorReading } from "@/types/reading";
import {
  MOCK_LATEST_READING,
  MOCK_INITIAL_CHART_DATA,
  generateNextReading,
} from "@/lib/mockData";

const MOCK_INTERVAL_MS = 3000; // Simulasi data baru setiap 3 detik

interface UseMockSSEOptions {
  onReading?: (reading: SensorReading) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

/**
 * Drop-in replacement untuk useSSE, menggunakan data dummy realistis.
 * Digunakan saat NEXT_PUBLIC_DEMO_MODE=true.
 */
export function useMockSSE({
  onReading,
  enabled = true,
}: UseMockSSEOptions = {}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestRef = useRef<SensorReading>(MOCK_LATEST_READING);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Kirim initial data secara berurutan agar chart terisi langsung
    const initialBatch = [...MOCK_INITIAL_CHART_DATA];
    let batchIdx = 0;

    const sendInitial = () => {
      if (batchIdx < initialBatch.length) {
        onReading?.(initialBatch[batchIdx]);
        latestRef.current = initialBatch[batchIdx];
        batchIdx++;
      } else {
        clearInterval(initInterval);
        // Setelah initial data selesai, mulai interval normal
        intervalRef.current = setInterval(() => {
          const next = generateNextReading(latestRef.current);
          latestRef.current = next;
          onReading?.(next);
        }, MOCK_INTERVAL_MS);
      }
    };

    // Kirim 30 data awal dengan delay kecil antar data
    const initInterval = setInterval(sendInitial, 30);

    return () => {
      clearInterval(initInterval);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, onReading]);

  return { disconnect: () => intervalRef.current && clearInterval(intervalRef.current) };
}
