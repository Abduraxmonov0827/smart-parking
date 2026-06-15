import prisma from '../config/database';
import { SlotStatus } from '@prisma/client';
import { calculateFee, getDurationMinutes } from '../utils/helpers';

export class ParkingService {
  async getSlots(filters?: { status?: SlotStatus; search?: string; zone?: string }) {
    return prisma.parkingSlot.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.zone && { zone: filters.zone }),
        ...(filters?.search && {
          OR: [
            { slotNumber: { contains: filters.search } },
            { zone: { contains: filters.search } },
          ],
        }),
      },
      include: {
        transactions: {
          where: { status: 'ACTIVE' },
          include: { vehicle: { select: { plateNumber: true, ownerName: true, vehicleType: true } } },
          take: 1,
        },
      },
      orderBy: [{ floor: 'asc' }, { zone: 'asc' }, { slotNumber: 'asc' }],
    });
  }

  async getSlotById(id: string) {
    const slot = await prisma.parkingSlot.findUnique({
      where: { id },
      include: {
        transactions: {
          where: { status: 'ACTIVE' },
          include: { vehicle: true },
        },
        sensorLogs: { orderBy: { timestamp: 'desc' }, take: 10 },
      },
    });
    if (!slot) throw new Error('Parking slot not found');
    return slot;
  }

  async checkIn(plateNumber: string, slotId?: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { plateNumber } });
    if (!vehicle) throw new Error('Vehicle not registered. Please register first.');

    const activeSession = await prisma.parkingTransaction.findFirst({
      where: { vehicleId: vehicle.id, status: 'ACTIVE' },
    });
    if (activeSession) throw new Error('Vehicle already has an active parking session');

    let slot;
    if (slotId) {
      slot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
      if (!slot) throw new Error('Parking slot not found');
      if (slot.status !== 'AVAILABLE') throw new Error('Selected slot is not available');
    } else {
      slot = await prisma.parkingSlot.findFirst({ where: { status: 'AVAILABLE' }, orderBy: { slotNumber: 'asc' } });
      if (!slot) throw new Error('No available parking slots');
    }

    const [transaction] = await prisma.$transaction([
      prisma.parkingTransaction.create({
        data: { vehicleId: vehicle.id, slotId: slot.id },
        include: { vehicle: true, slot: true },
      }),
      prisma.parkingSlot.update({
        where: { id: slot.id },
        data: { status: 'OCCUPIED', sensorValue: 15.0 },
      }),
    ]);

    return transaction;
  }

  async checkOut(plateNumber?: string, transactionId?: string) {
    let transaction;
    if (transactionId) {
      transaction = await prisma.parkingTransaction.findFirst({
        where: { id: transactionId, status: 'ACTIVE' },
        include: { vehicle: true, slot: true },
      });
    } else if (plateNumber) {
      transaction = await prisma.parkingTransaction.findFirst({
        where: { vehicle: { plateNumber }, status: 'ACTIVE' },
        include: { vehicle: true, slot: true },
      });
    }

    if (!transaction) throw new Error('No active parking session found');

    const settings = await prisma.systemSettings.findFirst({ where: { id: 1 } });
    const hourlyRate = settings?.hourlyRate ?? 5.0;
    const exitTime = new Date();
    const duration = getDurationMinutes(transaction.entryTime, exitTime);
    const fee = calculateFee(duration, hourlyRate);

    const [completed] = await prisma.$transaction([
      prisma.parkingTransaction.update({
        where: { id: transaction.id },
        data: { exitTime, duration, fee, status: 'COMPLETED' },
        include: { vehicle: true, slot: true },
      }),
      prisma.parkingSlot.update({
        where: { id: transaction.slotId },
        data: { status: 'AVAILABLE', sensorValue: 100.0 },
      }),
    ]);

    return completed;
  }

  async getActiveTransactions() {
    return prisma.parkingTransaction.findMany({
      where: { status: 'ACTIVE' },
      include: { vehicle: true, slot: true },
      orderBy: { entryTime: 'desc' },
    });
  }

  async getTransactionLogs(status?: 'ACTIVE' | 'COMPLETED') {
    return prisma.parkingTransaction.findMany({
      where: status ? { status } : undefined,
      include: { vehicle: true, slot: true },
      orderBy: { entryTime: 'desc' },
      take: 100,
    });
  }
}

export const parkingService = new ParkingService();
