import { Router } from 'express';
import { asyncHandler, authenticate, authorize, validate } from '../middleware';
import { settingsSchema } from '../validators/schemas';
import * as settingsCtrl from '../controllers/settings.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(settingsCtrl.getSettings));
router.put('/', authorize('ADMIN', 'OPERATOR'), validate(settingsSchema), asyncHandler(settingsCtrl.updateSettings));
router.get('/arduino', asyncHandler(settingsCtrl.getArduinoStatus));

export default router;
