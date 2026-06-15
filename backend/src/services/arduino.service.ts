import prisma from '../config/database';
import { config } from '../config';

export class SettingsService {
  async get() {
    let settings = await prisma.systemSettings.findFirst({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.systemSettings.create({ data: { id: 1 } });
    }
    return settings;
  }

  async update(data: Partial<{
    facilityName: string;
    totalSlots: number;
    hourlyRate: number;
    currency: string;
    openTime: string;
    closeTime: string;
    arduinoEnabled: boolean;
    sensorThreshold: number;
  }>) {
    return prisma.systemSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
  }
}

export const settingsService = new SettingsService();

/**
 * Arduino HC-SR04 Ultrasonic Sensor Simulator
 *
 * Simulates an Arduino microcontroller reading ultrasonic distance sensors
 * attached to each parking slot. Updates slot occupancy based on distance
 * readings and logs all sensor events to the database.
 *
 * Distance < threshold → vehicle detected (OCCUPIED)
 * Distance >= threshold → slot empty (AVAILABLE)
 */
class ArduinoSimulator {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) return;

    const settings = await settingsService.get();
    if (!settings.arduinoEnabled) {
      console.log('[Arduino] Simulator disabled in settings');
      return;
    }

    const intervalMs = config.arduino.intervalMs;
    console.log(`[Arduino] HC-SR04 Simulator started — interval: ${intervalMs / 1000}s`);

    this.isRunning = true;
    await this.simulate();
    this.interval = setInterval(() => this.simulate(), intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('[Arduino] Simulator stopped');
  }

  async restart(): Promise<void> {
    this.stop();
    await this.start();
  }

  private async simulate(): Promise<void> {
    const settings = await settingsService.get();
    const threshold = settings.sensorThreshold;

    const slots = await prisma.parkingSlot.findMany({
      where: { status: { notIn: ['MAINTENANCE', 'RESERVED'] }, sensorStatus: 'ACTIVE' },
    });

    for (const slot of slots) {
      let sensorValue: number;
      let newStatus = slot.status;

      if (slot.status === 'OCCUPIED') {
        // Vehicle present: short distance reading with small noise
        sensorValue = 8 + Math.random() * (threshold - 5);
        // 8% chance vehicle leaves
        if (Math.random() < 0.08) {
          sensorValue = threshold + 20 + Math.random() * 40;
          newStatus = 'AVAILABLE';
          await prisma.parkingTransaction.updateMany({
            where: { slotId: slot.id, status: 'ACTIVE' },
            data: { status: 'COMPLETED', exitTime: new Date() },
          });
        }
      } else {
        // Empty slot: long distance reading
        if (Math.random() < 0.06) {
          // 6% chance new vehicle arrives
          sensorValue = 8 + Math.random() * (threshold - 5);
          newStatus = 'OCCUPIED';
        } else {
          sensorValue = threshold + 15 + Math.random() * 55;
          newStatus = 'AVAILABLE';
        }
      }

      sensorValue = Math.round(sensorValue * 10) / 10;

      await prisma.$transaction([
        prisma.parkingSlot.update({
          where: { id: slot.id },
          data: { sensorValue, status: newStatus },
        }),
        prisma.sensorLog.create({
          data: { slotId: slot.id, sensorValue },
        }),
      ]);
    }

    // Prune old sensor logs (keep last 1000)
    const oldLogs = await prisma.sensorLog.findMany({
      orderBy: { timestamp: 'desc' },
      skip: 1000,
      select: { id: true },
    });
    if (oldLogs.length > 0) {
      await prisma.sensorLog.deleteMany({
        where: { id: { in: oldLogs.map((l) => l.id) } },
      });
    }
  }

  async getLatestReadings() {
    const slots = await prisma.parkingSlot.findMany({
      select: { id: true, slotNumber: true, sensorValue: true, status: true, updatedAt: true },
      orderBy: { slotNumber: 'asc' },
    });
    return {
      status: 'simulated',
      module: 'HC-SR04 Ultrasonic Sensor',
      interval: config.arduino.intervalMs,
      readings: slots,
    };
  }
}

export const arduinoSimulator = new ArduinoSimulator();
