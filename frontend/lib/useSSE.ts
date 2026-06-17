"use client";

import { useEffect, useCallback, useRef } from "react";
import { SensorReading } from "@/types/reading";
import api from "@/lib/api";

interface UseSSEOptions {
  onReading?: (reading: SensorReading, isLive?: boolean) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

export function useSSE({
  onReading,
  onError,
  enabled = true,
}: UseSSEOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(1000); // start at 1s, backoff up to 30s

  const onReadingRef = useRef(onReading);
  const onErrorRef = useRef(onError);

  useEffect(() => { onReadingRef.current = onReading; }, [onReading]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  // Fetch latest reading immediately from REST API (before SSE connects)
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    api.get<SensorReading>("/readings/latest")
      .then((res) => {
        onReadingRef.current?.(res.data, false);
      })
      .catch(() => {
        // No data yet, silently ignore
      });
  }, [enabled]);

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    if (!token) return; // Can't connect to SSE without a token

    // Pass token as query param — EventSource cannot set custom headers
    const sseUrl = `/api/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      console.log("[SSE] Connected to SCENTINEL stream");
      reconnectDelayRef.current = 1000; // reset backoff
    });

    es.addEventListener("reading", (event: MessageEvent) => {
      try {
        const reading: SensorReading = JSON.parse(event.data);
        onReadingRef.current?.(reading, true);
      } catch (err) {
        console.error("[SSE] Failed to parse reading:", err);
      }
    });

    es.onerror = (error) => {
      console.warn("[SSE] Error, reconnecting...");
      es.close();
      onErrorRef.current?.(error);

      // Exponential backoff reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
        connect();
      }, reconnectDelayRef.current);
    };
  }, [enabled]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  return { disconnect };
}
