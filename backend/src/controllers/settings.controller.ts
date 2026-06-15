import { Request, Response } from 'express';
import { sendSuccess } from '../utils/helpers';
import { settingsService, arduinoSimulator } from '../services/arduino.service';

export async function getSettings(_req: Request, res: Response) {
  const settings = await settingsService.get();
  sendSuccess(res, settings);
}

export async function updateSettings(req: Request, res: Response) {
  const settings = await settingsService.update(req.body);
  if (req.body.arduinoEnabled !== undefined) {
    if (settings.arduinoEnabled) await arduinoSimulator.restart();
    else arduinoSimulator.stop();
  }
  sendSuccess(res, settings);
}

export async function getArduinoStatus(_req: Request, res: Response) {
  const data = await arduinoSimulator.getLatestReadings();
  sendSuccess(res, data);
}
