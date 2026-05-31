// SCENTINEL - Device Types
export type DeviceStatus = "ONLINE" | "OFFLINE";

export interface Device {
  id: number;
  device_name: string;
  serial_number: string;
  firmware_version: string | null;
  last_seen: string | null;
  status: DeviceStatus;
}

export interface DeviceCreate {
  device_name: string;
  serial_number: string;
  firmware_version?: string;
}

export interface DeviceUpdate {
  device_name?: string;
  firmware_version?: string;
  status?: DeviceStatus;
}
