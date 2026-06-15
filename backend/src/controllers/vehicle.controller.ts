import { Request, Response } from 'express';
import { sendSuccess } from '../utils/helpers';
import { paramId } from '../utils/params';
import { vehicleService } from '../services/vehicle.service';

export async function getVehicles(req: Request, res: Response) {
  const search = req.query.search as string | undefined;
  const vehicles = await vehicleService.findAll(search);
  sendSuccess(res, vehicles);
}

export async function getVehicle(req: Request, res: Response) {
  const vehicle = await vehicleService.findById(paramId(req.params.id));
  sendSuccess(res, vehicle);
}

export async function createVehicle(req: Request, res: Response) {
  const vehicle = await vehicleService.create(req.body);
  sendSuccess(res, vehicle, 201);
}

export async function updateVehicle(req: Request, res: Response) {
  const vehicle = await vehicleService.update(paramId(req.params.id), req.body);
  sendSuccess(res, vehicle);
}

export async function deleteVehicle(req: Request, res: Response) {
  const result = await vehicleService.delete(paramId(req.params.id));
  sendSuccess(res, result);
}

export async function getVehicleHistory(req: Request, res: Response) {
  const history = await vehicleService.getHistory(paramId(req.params.id));
  sendSuccess(res, history);
}
