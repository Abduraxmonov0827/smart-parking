import { Router } from 'express';
import { asyncHandler, authenticate } from '../middleware';
import * as reportCtrl from '../controllers/report.controller';

const router = Router();

router.use(authenticate);

router.get('/dashboard', asyncHandler(reportCtrl.getDashboard));
router.get('/daily', asyncHandler(reportCtrl.getDaily));
router.get('/weekly', asyncHandler(reportCtrl.getWeekly));
router.get('/monthly', asyncHandler(reportCtrl.getMonthly));
router.get('/occupancy-trend', asyncHandler(reportCtrl.getOccupancyTrend));
router.get('/vehicle-stats', asyncHandler(reportCtrl.getVehicleStats));
router.get('/hourly-entries', asyncHandler(reportCtrl.getHourlyEntries));
router.get('/sensor-activity', asyncHandler(reportCtrl.getSensorActivity));
router.get('/zone-occupancy', asyncHandler(reportCtrl.getZoneOccupancy));
router.get('/recent-activity', asyncHandler(reportCtrl.getRecentActivity));

export default router;
