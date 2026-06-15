import prisma from '../config/database';

export class VehicleService {
  async findAll(search?: string) {
    return prisma.vehicle.findMany({
      where: search
        ? {
            OR: [
              { plateNumber: { contains: search } },
              { ownerName: { contains: search } },
            ],
          }
        : undefined,
      include: {
        transactions: {
          orderBy: { entryTime: 'desc' },
          take: 5,
          include: { slot: { select: { slotNumber: true } } },
        },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { entryTime: 'desc' },
          include: { slot: true },
        },
      },
    });
    if (!vehicle) throw new Error('Vehicle not found');
    return vehicle;
  }

  async create(data: { plateNumber: string; ownerName: string; vehicleType?: string; color?: string; phone?: string }) {
    const existing = await prisma.vehicle.findUnique({ where: { plateNumber: data.plateNumber } });
    if (existing) throw new Error('Vehicle with this plate number already exists');

    return prisma.vehicle.create({ data });
  }

  async update(id: string, data: Partial<{ plateNumber: string; ownerName: string; vehicleType: string; color: string; phone: string }>) {
    await this.findById(id);
    return prisma.vehicle.update({ where: { id }, data });
  }

  async delete(id: string) {
    const active = await prisma.parkingTransaction.findFirst({
      where: { vehicleId: id, status: 'ACTIVE' },
    });
    if (active) throw new Error('Cannot delete vehicle with active parking session');

    await prisma.$transaction([
      prisma.parkingTransaction.deleteMany({ where: { vehicleId: id } }),
      prisma.vehicle.delete({ where: { id } }),
    ]);
    return { message: 'Vehicle deleted successfully' };
  }

  async getHistory(id: string) {
    return prisma.parkingTransaction.findMany({
      where: { vehicleId: id },
      include: { slot: true },
      orderBy: { entryTime: 'desc' },
    });
  }
}

export const vehicleService = new VehicleService();
