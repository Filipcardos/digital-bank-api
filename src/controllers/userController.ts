import { Request, Response } from 'express';
import { userService } from '../services/userService';

export const userController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.create(req.body);
    res.status(201).json(result);
  },

  list: (_req: Request, res: Response): void => {
    res.status(200).json(userService.list());
  },

  getById: (req: Request, res: Response): void => {
    res.status(200).json(userService.getById(req.params.id));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const updated = await userService.update(req.params.id, req.body);
    res.status(200).json(updated);
  },

  delete: (req: Request, res: Response): void => {
    userService.delete(req.params.id);
    res.status(204).send();
  },
};
