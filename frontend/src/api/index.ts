import api from './axios';
import type {
  User, Vehicle, ParkingSlot, ParkingTransaction,
  DashboardStats, SystemSettings, SystemLog, ApiResponse,
} from '../types';

async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url, { params });
  return data.data;
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data.data;
}

async function put<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put<ApiResponse<T>>(url, body);
  return data.data;
}

async function del<T>(url: string): Promise<T> {
  const { data } = await api.delete<ApiResponse<T>>(url);
  return data.data;
}

export interface DailyReport {
  date: string;
  entries: number;
  exits: number;
  revenue: number;
  avgDuration: number;
}

export interface WeeklyReportItem {
  date: string;
  entries: number;
  exits: number;
  revenue: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalSessions: number;
  completedSessions: number;
  totalRevenue: number;
  avgFee: number;
  transactions: ParkingTransaction[];
}

export interface OccupancyTrendItem {
  date: string;
  rate: number;
}

export interface VehicleStats {
  total: number;
  byType: { vehicleType: string; _count: number }[];
}

export interface ZoneOccupancy {
  zone: string;
  total: number;
  occupied: number;
}

export interface HourlyEntry {
  hour: string;
  entries: number;
}

export interface ArduinoStatus {
  status: string;
  module: string;
  interval: number;
  readings: { id: string; slotNumber: string; sensorValue: number; status: string }[];
}

export const authApi = {
  login: (email: string, password: string) => post<{ user: User; token: string }>('/auth/login', { email, password }),
  register: (body: { username: string; email: string; password: string }) => post<{ user: User; token: string }>('/auth/register', body),
  getProfile: () => get<User>('/auth/profile'),
};

export const vehicleApi = {
  getAll: (search?: string) => get<Vehicle[]>('/vehicles', search ? { search } : undefined),
  getById: (id: string) => get<Vehicle>(`/vehicles/${id}`),
  create: (body: Partial<Vehicle>) => post<Vehicle>('/vehicles', body),
  update: (id: string, body: Partial<Vehicle>) => put<Vehicle>(`/vehicles/${id}`, body),
  delete: (id: string) => del(`/vehicles/${id}`),
  getHistory: (id: string) => get<ParkingTransaction[]>(`/vehicles/${id}/history`),
};

export const parkingApi = {
  getSlots: (params?: { status?: string; search?: string; zone?: string }) => get<ParkingSlot[]>('/parking/slots', params),
  getSlot: (id: string) => get<ParkingSlot>(`/parking/slots/${id}`),
  checkIn: (plateNumber: string, slotId?: string) => post<ParkingTransaction>('/parking/checkin', { plateNumber, slotId }),
  checkOut: (plateNumber?: string, transactionId?: string) => post<ParkingTransaction>('/parking/checkout', { plateNumber, transactionId }),
  getActive: () => get<ParkingTransaction[]>('/parking/active'),
  getLogs: (status?: string) => get<ParkingTransaction[]>('/parking/logs', status ? { status } : undefined),
};

export const reportApi = {
  getDashboard: () => get<DashboardStats>('/reports/dashboard'),
  getDaily: (date?: string) => get<DailyReport>('/reports/daily', date ? { date } : undefined),
  getWeekly: () => get<WeeklyReportItem[]>('/reports/weekly'),
  getMonthly: (year?: number, month?: number) => get<MonthlyReport>('/reports/monthly', { year, month }),
  getOccupancyTrend: (days?: number) => get<OccupancyTrendItem[]>('/reports/occupancy-trend', days ? { days } : undefined),
  getVehicleStats: () => get<VehicleStats>('/reports/vehicle-stats'),
  getHourlyEntries: () => get<HourlyEntry[]>('/reports/hourly-entries'),
  getSensorActivity: (limit?: number) => get('/reports/sensor-activity', limit ? { limit } : undefined),
  getZoneOccupancy: () => get<ZoneOccupancy[]>('/reports/zone-occupancy'),
  getRecentActivity: () => get<ParkingTransaction[]>('/reports/recent-activity'),
};

export const adminApi = {
  getUsers: () => get<User[]>('/admin/users'),
  updateUser: (id: string, body: Partial<User>) => put<User>(`/admin/users/${id}`, body),
  deleteUser: (id: string) => del(`/admin/users/${id}`),
  getLogs: (limit?: number) => get<SystemLog[]>('/admin/logs', limit ? { limit } : undefined),
};

export const settingsApi = {
  get: () => get<SystemSettings>('/settings'),
  update: (body: Partial<SystemSettings>) => put<SystemSettings>('/settings', body),
  getArduino: () => get<ArduinoStatus>('/settings/arduino'),
};
