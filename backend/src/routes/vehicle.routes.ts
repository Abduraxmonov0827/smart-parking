import { Router } from 'express';
import { asyncHandler, authenticate, validate } from '../middleware';
import { vehicleSchema } from '../validators/schemas';
import * as vehicleCtrl from '../controllers/vehicle.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(vehicleCtrl.getVehicles));
router.get('/:id', asyncHandler(vehicleCtrl.getVehicle));
router.get('/:id/history', asyncHandler(vehicleCtrl.getVehicleHistory));
router.post('/', validate(vehicleSchema), asyncHandler(vehicleCtrl.createVehicle));
router.put('/:id', validate(vehicleSchema.partial()), asyncHandler(vehicleCtrl.updateVehicle));
router.delete('/:id', asyncHandler(vehicleCtrl.deleteVehicle));

export default router;
