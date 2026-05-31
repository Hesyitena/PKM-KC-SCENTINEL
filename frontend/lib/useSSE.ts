"use client";

import { useEffect, useCallback, useRef } from "react";
import { SensorReading } from "@/types/reading";

interface UseSSEOptions {
  onReading?: (reading: SensorReading) => void;
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

  const connect = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    const sseUrl = process.env.NEXT_PUBLIC_SSE_URL || "http://localhost/api/stream";
    const url = token ? `${sseUrl}?token=${token}` : sseUrl;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      console.log("[SSE] Connected to SCENTINEL stream");
      reconnectDelayRef.current = 1000; // reset backoff
    });

    es.addEventListener("reading", (event: MessageEvent) => {
      try {
        const reading: SensorReading = JSON.parse(event.data);
        onReading?.(reading);
      } catch (err) {
        console.error("[SSE] Failed to parse reading:", err);
      }
    });

    es.onerror = (error) => {
      console.warn("[SSE] Error, reconnecting...");
      es.close();
      onError?.(error);

      // Exponential backoff reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
        connect();
      }, reconnectDelayRef.current);
    };
  }, [enabled, onReading, onError]);

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
