export type Role = 'ADMIN' | 'OPERATOR' | 'USER';
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type TransactionStatus = 'ACTIVE' | 'COMPLETED';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  ownerName: string;
  vehicleType: string;
  color: string;
  phone: string;
  createdAt: string;
  transactions?: ParkingTransaction[];
  _count?: { transactions: number };
}

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  floor: number;
  zone: string;
  status: SlotStatus;
  sensorStatus: string;
  sensorValue: number;
  createdAt: string;
  updatedAt: string;
  transactions?: ParkingTransaction[];
}

export interface ParkingTransaction {
  id: string;
  vehicleId: string;
  slotId: string;
  entryTime: string;
  exitTime: string | null;
  duration: number | null;
  fee: number;
  status: TransactionStatus;
  vehicle?: Vehicle;
  slot?: ParkingSlot;
}

export interface DashboardStats {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  maintenanceSlots: number;
  activeSessions: number;
  todayEntries: number;
  todayExits: number;
  todayRevenue: number;
  occupancyRate: number;
}

export interface SystemSettings {
  id: number;
  facilityName: string;
  totalSlots: number;
  hourlyRate: number;
  currency: string;
  openTime: string;
  closeTime: string;
  arduinoEnabled: boolean;
  sensorThreshold: number;
}

export interface SystemLog {
  id: string;
  userId: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user?: { username: string; email: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
