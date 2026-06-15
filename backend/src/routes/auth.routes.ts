import { Router } from 'express';
import { asyncHandler, authenticate, authorize, validate } from '../middleware';
import { loginSchema, registerSchema } from '../validators/schemas';
import * as authCtrl from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(authCtrl.register));
router.post('/login', validate(loginSchema), asyncHandler(authCtrl.login));
router.get('/profile', authenticate, asyncHandler(authCtrl.getProfile));

export default router;
