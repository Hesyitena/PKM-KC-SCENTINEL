// SCENTINEL - Utility Functions
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy, HH:mm:ss", { locale: localeId });
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: localeId });
}

export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

export function formatSensorValue(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

export function isOnline(lastSeen: string | null, thresholdSeconds: number = 120): boolean {
  if (!lastSeen) return false;
  const diff = (Date.now() - new Date(lastSeen).getTime()) / 1000;
  return diff < thresholdSeconds;
}
