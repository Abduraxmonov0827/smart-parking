import { Request, Response } from 'express';
import { SlotStatus } from '@prisma/client';
import { AuthRequest } from '../middleware';
import { sendSuccess } from '../utils/helpers';
import { paramId } from '../utils/params';
import { parkingService } from '../services/parking.service';
import { adminService } from '../services/admin.service';

export async function getSlots(req: Request, res: Response) {
  const filters = {
    status: req.query.status as SlotStatus | undefined,
    search: req.query.search as string | undefined,
    zone: req.query.zone as string | undefined,
  };
  const slots = await parkingService.getSlots(filters);
  sendSuccess(res, slots);
}

export async function getSlot(req: Request, res: Response) {
  const slot = await parkingService.getSlotById(paramId(req.params.id));
  sendSuccess(res, slot);
}

export async function checkIn(req: AuthRequest, res: Response) {
  const { plateNumber, slotId } = req.body;
  const transaction = await parkingService.checkIn(plateNumber, slotId);
  await adminService.createLog({
    userId: req.user?.userId,
    action: 'VEHICLE_CHECKIN',
    details: `${plateNumber} → Slot ${transaction.slot.slotNumber}`,
    ipAddress: req.ip,
  });
  sendSuccess(res, transaction, 201);
}

export async function checkOut(req: AuthRequest, res: Response) {
  const { plateNumber, transactionId } = req.body;
  const transaction = await parkingService.checkOut(plateNumber, transactionId);
  await adminService.createLog({
    userId: req.user?.userId,
    action: 'VEHICLE_CHECKOUT',
    details: `${transaction.vehicle.plateNumber} — Fee: $${transaction.fee}`,
    ipAddress: req.ip,
  });
  sendSuccess(res, transaction);
}

export async function getActiveTransactions(_req: Request, res: Response) {
  const transactions = await parkingService.getActiveTransactions();
  sendSuccess(res, transactions);
}

export async function getTransactionLogs(req: Request, res: Response) {
  const status = req.query.status as 'ACTIVE' | 'COMPLETED' | undefined;
  const logs = await parkingService.getTransactionLogs(status);
  sendSuccess(res, logs);
}
