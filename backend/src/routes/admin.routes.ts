import { Router } from 'express';
import { asyncHandler, authenticate, authorize, validate } from '../middleware';
import { updateUserSchema } from '../validators/schemas';
import * as adminCtrl from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/users', asyncHandler(adminCtrl.getUsers));
router.put('/users/:id', validate(updateUserSchema), asyncHandler(adminCtrl.updateUser));
router.delete('/users/:id', asyncHandler(adminCtrl.deleteUser));
router.get('/logs', asyncHandler(adminCtrl.getLogs));

export default router;
