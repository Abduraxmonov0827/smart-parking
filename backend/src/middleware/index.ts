import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/helpers';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: Role;
  };
}

/** Authenticate JWT bearer token */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  try {
    const token = header.split(' ')[1];
    req.user = verifyToken(token);
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}

/** Restrict access to specific roles */
export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }
    next();
  };
}

/** Global error handler middleware */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error]', err.message);
  sendError(res, err.message || 'Internal server error', 500);
}

/** Async route wrapper to catch errors */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

/** Zod validation middleware factory */
export function validate<T>(schema: { parse: (data: unknown) => T }, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = source === 'body' ? req.body : req.query;
      req.body = source === 'body' ? schema.parse(data) : req.body;
      if (source === 'query') (req as Request & { validatedQuery: T }).validatedQuery = schema.parse(data);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        sendError(res, err.errors[0].message, 400);
        return;
      }
      sendError(res, 'Validation failed', 400);
    }
  };
}
