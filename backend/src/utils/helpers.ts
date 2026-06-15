import { Response } from 'express';

/** Standard API success response */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ success: true, data });
}

/** Standard API error response */
export function sendError(res: Response, message: string, statusCode = 400): void {
  res.status(statusCode).json({ success: false, error: message });
}

/** Calculate parking fee based on duration in minutes */
export function calculateFee(durationMinutes: number, hourlyRate: number): number {
  const hours = Math.max(1, Math.ceil(durationMinutes / 60));
  return hours * hourlyRate;
}

/** Calculate duration between two dates in minutes */
export function getDurationMinutes(entry: Date, exit: Date): number {
  return Math.round((exit.getTime() - entry.getTime()) / (1000 * 60));
}

/** Format date for reports */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Get start of day */
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get start of month */
export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
