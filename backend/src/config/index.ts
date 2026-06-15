import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  arduino: {
    intervalMs: parseInt(process.env.ARDUINO_INTERVAL_MS || '15000', 10),
    sensorThreshold: parseFloat(process.env.SENSOR_THRESHOLD_CM || '30'),
  },
  parking: {
    hourlyRate: parseFloat(process.env.HOURLY_RATE || '5'),
    facilityName: process.env.FACILITY_NAME || 'Smart Parking Facility',
  },
} as const;
