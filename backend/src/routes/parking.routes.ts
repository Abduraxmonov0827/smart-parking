import { Router } from 'express';
import { asyncHandler, authenticate, validate } from '../middleware';
import { checkInSchema, checkOutSchema } from '../validators/schemas';
import * as parkingCtrl from '../controllers/parking.controller';

const router = Router();

router.use(authenticate);

router.get('/slots', asyncHandler(parkingCtrl.getSlots));
router.get('/slots/:id', asyncHandler(parkingCtrl.getSlot));
router.post('/checkin', validate(checkInSchema), asyncHandler(parkingCtrl.checkIn));
router.post('/checkout', validate(checkOutSchema), asyncHandler(parkingCtrl.checkOut));
router.get('/active', asyncHandler(parkingCtrl.getActiveTransactions));
router.get('/logs', asyncHandler(parkingCtrl.getTransactionLogs));

export default router;
