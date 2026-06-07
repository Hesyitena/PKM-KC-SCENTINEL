// SCENTINEL - Reading Types
export type PredictionLabel = "LAYAK" | "TIDAK LAYAK";

export interface SensorReading {
  id: number;
  timestamp: string;
  mq3: number;
  mq4: number;
  mq135: number;
  tgs2602: number;
  temperature: number;
  humidity: number;
  prediction: PredictionLabel;
  confidence: number;
  food_name: string | null;
  device_id: number;
}

export interface ReadingLatest extends SensorReading {
  device_name: string | null;
  device_serial: string | null;
}

export interface PaginatedReadings {
  total: number;
  limit: number;
  offset: number;
  items: SensorReading[];
}

export interface ReadingHistoryParams {
  start_date?: string;
  end_date?: string;
  prediction?: PredictionLabel;
  food_name?: string;
  limit?: number;
  offset?: number;
}

export interface ReadingCreate {
  device_id: number;
  mq3: number;
  mq4: number;
  mq135: number;
  tgs2602: number;
  temperature: number;
  humidity: number;
  prediction: PredictionLabel;
  confidence: number;
  food_name?: string;
}
