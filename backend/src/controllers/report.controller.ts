import { Request, Response } from 'express';
import { sendSuccess } from '../utils/helpers';
import { reportService } from '../services/report.service';

export async function getDashboard(_req: Request, res: Response) {
  const stats = await reportService.getDashboardStats();
  sendSuccess(res, stats);
}

export async function getDaily(req: Request, res: Response) {
  const date = req.query.date as string | undefined;
  const report = await reportService.getDailyReport(date);
  sendSuccess(res, report);
}

export async function getWeekly(_req: Request, res: Response) {
  const report = await reportService.getWeeklyReport();
  sendSuccess(res, report);
}

export async function getMonthly(req: Request, res: Response) {
  const year = req.query.year ? parseInt(req.query.year as string) : undefined;
  const month = req.query.month ? parseInt(req.query.month as string) - 1 : undefined;
  const report = await reportService.getMonthlyReport(year, month);
  sendSuccess(res, report);
}

export async function getOccupancyTrend(req: Request, res: Response) {
  const days = parseInt(req.query.days as string) || 7;
  const trend = await reportService.getOccupancyTrend(days);
  sendSuccess(res, trend);
}

export async function getVehicleStats(_req: Request, res: Response) {
  const stats = await reportService.getVehicleStats();
  sendSuccess(res, stats);
}

export async function getHourlyEntries(_req: Request, res: Response) {
  const data = await reportService.getHourlyEntries();
  sendSuccess(res, data);
}

export async function getSensorActivity(req: Request, res: Response) {
  const limit = parseInt(req.query.limit as string) || 50;
  const activity = await reportService.getSensorActivity(limit);
  sendSuccess(res, activity);
}

export async function getZoneOccupancy(_req: Request, res: Response) {
  const zones = await reportService.getZoneOccupancy();
  sendSuccess(res, zones);
}

export async function getRecentActivity(_req: Request, res: Response) {
  const { parkingService } = await import('../services/parking.service');
  const logs = await parkingService.getTransactionLogs();
  sendSuccess(res, logs.slice(0, 10));
}
