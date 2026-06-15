import { Response } from 'express';
import { AuthRequest } from '../middleware';
import { sendSuccess } from '../utils/helpers';
import { authService } from '../services/auth.service';
import { adminService } from '../services/admin.service';

export async function register(req: AuthRequest, res: Response) {
  const result = await authService.register(req.body);
  await adminService.createLog({ action: 'USER_REGISTER', details: `User ${result.user.username} registered` });
  sendSuccess(res, result, 201);
}

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  await adminService.createLog({
    userId: result.user.id,
    action: 'USER_LOGIN',
    details: `User ${result.user.username} logged in`,
    ipAddress: req.ip,
  });
  sendSuccess(res, result);
}

export async function getProfile(req: AuthRequest, res: Response) {
  const user = await authService.getProfile(req.user!.userId);
  sendSuccess(res, user);
}
