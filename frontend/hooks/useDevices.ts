"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Device } from "@/types/device";

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<Device[]>("/devices/");
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
