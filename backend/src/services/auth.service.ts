import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { Role } from '@prisma/client';

export class AuthService {
  async register(data: { username: string; email: string; password: string; role?: Role }) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) throw new Error('Username or email already exists');

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashed,
        role: data.role || 'USER',
      },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });

    const token = generateToken({ userId: user.id, username: user.username, role: user.role });
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid email or password');

    const token = generateToken({ userId: user.id, username: user.username, role: user.role });
    return {
      user: { id: user.id, username: user.username, email: user.email, role: user.role, createdAt: user.createdAt },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new Error('User not found');
    return user;
  }
}

export const authService = new AuthService();
