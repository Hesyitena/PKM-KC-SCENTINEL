"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Device } from "@/types/device";
import { MOCK_DEVICES } from "@/lib/mockData";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Demo mode: pakai data dummy
    if (DEMO_MODE) {
      setDevices(MOCK_DEVICES);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get<Device[]>("/devices");
      setDevices(res.data);
    } catch {
      setError("Gagal memuat data perangkat");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return { devices, isLoading, error, refetch: fetchDevices };
}

export function useDevice(id: number) {
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      // Demo mode: pakai data dummy
      if (DEMO_MODE) {
        const found = MOCK_DEVICES.find((d) => d.id === id) ?? null;
        setDevice(found);
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get<Device>(`/devices/${id}`);
        setDevice(res.data);
      } catch {
        setError("Perangkat tidak ditemukan");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { device, isLoading, error };
}
