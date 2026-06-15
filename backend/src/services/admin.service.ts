import prisma from '../config/database';
import { Role } from '@prisma/client';

export class AdminService {
  async getUsers() {
    return prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUser(id: string, data: { username?: string; email?: string; role?: Role }) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
  }

  async deleteUser(id: string) {
    await prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }

  async getLogs(limit = 100) {
    return prisma.systemLog.findMany({
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createLog(data: { userId?: string; action: string; details?: string; ipAddress?: string }) {
    return prisma.systemLog.create({ data });
  }
}

export const adminService = new AdminService();
