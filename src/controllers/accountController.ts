import { Request, Response } from 'express';
import { accountService } from '../services/accountService';

export const accountController = {
  getById: (req: Request, res: Response): void => {
    res.status(200).json(accountService.getById(req.params.id));
  },

  getBalance: (req: Request, res: Response): void => {
    res.status(200).json(accountService.getBalance(req.params.id));
  },

  deposit: (req: Request, res: Response): void => {
    const account = accountService.deposit(req.params.id, req.body?.amount);
    res.status(200).json(account);
  },

  withdraw: (req: Request, res: Response): void => {
    const account = accountService.withdraw(req.params.id, req.body?.amount);
    res.status(200).json(account);
  },

  transfer: (req: Request, res: Response): void => {
    const result = accountService.transfer(req.params.id, req.body?.toAccountId, req.body?.amount);
    res.status(200).json(result);
  },

  listTransactions: (req: Request, res: Response): void => {
    res.status(200).json(accountService.listTransactions(req.params.id));
  },
};
