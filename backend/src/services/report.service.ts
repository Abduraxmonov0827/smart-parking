import prisma from '../config/database';
import { startOfDay, startOfMonth } from '../utils/helpers';

export class ReportService {
  async getDashboardStats() {
    const today = startOfDay();
    const [slots, activeSessions, todayEntries, todayExits, todayRevenue] = await Promise.all([
      prisma.parkingSlot.groupBy({ by: ['status'], _count: true }),
      prisma.parkingTransaction.count({ where: { status: 'ACTIVE' } }),
      prisma.parkingTransaction.count({ where: { entryTime: { gte: today } } }),
      prisma.parkingTransaction.count({ where: { exitTime: { gte: today }, status: 'COMPLETED' } }),
      prisma.parkingTransaction.aggregate({
        where: { exitTime: { gte: today }, status: 'COMPLETED' },
        _sum: { fee: true },
      }),
    ]);

    const statusMap = Object.fromEntries(slots.map((s) => [s.status, s._count]));
    const total = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const occupied = statusMap['OCCUPIED'] || 0;

    return {
      totalSlots: total,
      availableSlots: statusMap['AVAILABLE'] || 0,
      occupiedSlots: occupied,
      reservedSlots: statusMap['RESERVED'] || 0,
      maintenanceSlots: statusMap['MAINTENANCE'] || 0,
      activeSessions,
      todayEntries,
      todayExits,
      todayRevenue: todayRevenue._sum.fee || 0,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  }

  async getDailyReport(date?: string) {
    const target = date ? new Date(date) : new Date();
    const start = startOfDay(target);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [entries, exits, revenue, occupancy] = await Promise.all([
      prisma.parkingTransaction.count({ where: { entryTime: { gte: start, lt: end } } }),
      prisma.parkingTransaction.count({ where: { exitTime: { gte: start, lt: end } } }),
      prisma.parkingTransaction.aggregate({
        where: { exitTime: { gte: start, lt: end }, status: 'COMPLETED' },
        _sum: { fee: true },
        _avg: { duration: true },
      }),
      prisma.parkingSlot.groupBy({ by: ['status'], _count: true }),
    ]);

    return {
      date: start.toISOString().split('T')[0],
      entries,
      exits,
      revenue: revenue._sum.fee || 0,
      avgDuration: Math.round(revenue._avg.duration || 0),
      occupancy,
    };
  }

  async getWeeklyReport() {
    const days: { date: string; entries: number; exits: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const report = await this.getDailyReport(d.toISOString().split('T')[0]);
      days.push({
        date: report.date,
        entries: report.entries,
        exits: report.exits,
        revenue: report.revenue,
      });
    }
    return days;
  }

  async getMonthlyReport(year?: number, month?: number) {
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 1);

    const transactions = await prisma.parkingTransaction.findMany({
      where: { entryTime: { gte: start, lt: end } },
      include: { vehicle: true, slot: true },
    });

    const completed = transactions.filter((t) => t.status === 'COMPLETED');
    const totalRevenue = completed.reduce((sum, t) => sum + t.fee, 0);

    return {
      year: y,
      month: m + 1,
      totalSessions: transactions.length,
      completedSessions: completed.length,
      totalRevenue,
      avgFee: completed.length > 0 ? totalRevenue / completed.length : 0,
      transactions: completed,
    };
  }

  async getOccupancyTrend(days = 7) {
    const trend: { date: string; rate: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = startOfDay(d);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const activeAtEnd = await prisma.parkingTransaction.count({
        where: {
          entryTime: { lt: end },
          OR: [{ exitTime: null }, { exitTime: { gte: end } }],
        },
      });
      const totalSlots = await prisma.parkingSlot.count();
      trend.push({
        date: start.toISOString().split('T')[0],
        rate: totalSlots > 0 ? Math.round((activeAtEnd / totalSlots) * 100) : 0,
      });
    }
    return trend;
  }

  async getVehicleStats() {
    const [byType, total] = await Promise.all([
      prisma.vehicle.groupBy({ by: ['vehicleType'], _count: true }),
      prisma.vehicle.count(),
    ]);
    return { total, byType };
  }

  async getHourlyEntries() {
    const today = startOfDay();
    const transactions = await prisma.parkingTransaction.findMany({
      where: { entryTime: { gte: today } },
      select: { entryTime: true },
    });

    const hours: Record<string, number> = {};
    for (let h = 0; h < 24; h++) hours[String(h).padStart(2, '0')] = 0;
    transactions.forEach((t) => {
      const hour = String(t.entryTime.getHours()).padStart(2, '0');
      hours[hour]++;
    });

    return Object.entries(hours).map(([hour, entries]) => ({ hour, entries }));
  }

  async getSensorActivity(limit = 50) {
    return prisma.sensorLog.findMany({
      include: { slot: { select: { slotNumber: true } } },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getZoneOccupancy() {
    const zones = await prisma.parkingSlot.groupBy({
      by: ['zone', 'status'],
      _count: true,
    });

    const zoneMap: Record<string, { total: number; occupied: number }> = {};
    zones.forEach((z) => {
      if (!zoneMap[z.zone]) zoneMap[z.zone] = { total: 0, occupied: 0 };
      zoneMap[z.zone].total += z._count;
      if (z.status === 'OCCUPIED') zoneMap[z.zone].occupied += z._count;
    });

    return Object.entries(zoneMap).map(([zone, data]) => ({ zone, ...data }));
  }
}

export const reportService = new ReportService();
