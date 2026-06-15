import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import parkingRoutes from './routes/parking.routes';
import reportRoutes from './routes/report.routes';
import adminRoutes from './routes/admin.routes';
import settingsRoutes from './routes/settings.routes';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin && corsOrigin !== '*' ? corsOrigin.split(',') : true,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'Smart Parking Management System',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorHandler);

export default app;
