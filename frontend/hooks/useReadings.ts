"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { PaginatedReadings, ReadingHistoryParams, ReadingLatest } from "@/types/reading";
import { MOCK_LATEST_READING, getMockHistory } from "@/lib/mockData";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function useLatestReading(deviceId?: number) {
  const [reading, setReading] = useState<ReadingLatest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    // Demo mode: pakai data dummy
    if (DEMO_MODE) {
      setReading(MOCK_LATEST_READING);
      setIsLoading(false);
      return;
    }
    try {
      const params = deviceId ? { device_id: deviceId } : {};
      const res = await api.get<ReadingLatest>("/readings/latest", { params });
      setReading(res.data);
    } catch {
      setError("Belum ada data pembacaan");
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { reading, isLoading, error, refetch: fetch };
}

export function useReadingHistory(params: ReadingHistoryParams) {
  const [data, setData] = useState<PaginatedReadings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    // Demo mode: pakai data dummy
    if (DEMO_MODE) {
      const result = getMockHistory(params.offset ?? 0, params.limit ?? 20, {
        device_id: params.device_id,
        prediction: params.prediction,
        food_name: params.food_name,
      });
      setData(result);
      setIsLoading(false);
      return;
    }
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
      );
      const res = await api.get<PaginatedReadings>("/readings/history", {
        params: cleanParams,
      });
      setData(res.data);
    } catch {
      setError("Gagal memuat riwayat pembacaan");
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
