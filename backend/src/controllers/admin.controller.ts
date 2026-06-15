import { Request, Response } from 'express';
import { sendSuccess } from '../utils/helpers';
import { paramId } from '../utils/params';
import { adminService } from '../services/admin.service';

export async function getUsers(_req: Request, res: Response) {
  const users = await adminService.getUsers();
  sendSuccess(res, users);
}

export async function updateUser(req: Request, res: Response) {
  const user = await adminService.updateUser(paramId(req.params.id), req.body);
  sendSuccess(res, user);
}

export async function deleteUser(req: Request, res: Response) {
  const result = await adminService.deleteUser(paramId(req.params.id));
  sendSuccess(res, result);
}

export async function getLogs(req: Request, res: Response) {
  const limit = parseInt(req.query.limit as string) || 100;
  const logs = await adminService.getLogs(limit);
  sendSuccess(res, logs);
}
