import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'OPERATOR', 'USER']).optional(),
});

export const vehicleSchema = z.object({
  plateNumber: z.string().min(2, 'Plate number is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  vehicleType: z.string().default('car'),
  color: z.string().default('white'),
  phone: z.string().optional(),
});

export const checkInSchema = z.object({
  plateNumber: z.string().min(2, 'Plate number is required'),
  slotId: z.string().uuid().optional(),
});

export const checkOutSchema = z.object({
  plateNumber: z.string().optional(),
  transactionId: z.string().uuid().optional(),
}).refine((d) => d.plateNumber || d.transactionId, {
  message: 'Either plateNumber or transactionId is required',
});

export const settingsSchema = z.object({
  facilityName: z.string().optional(),
  totalSlots: z.number().int().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  currency: z.string().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  arduinoEnabled: z.boolean().optional(),
  sensorThreshold: z.number().positive().optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'OPERATOR', 'USER']).optional(),
});
