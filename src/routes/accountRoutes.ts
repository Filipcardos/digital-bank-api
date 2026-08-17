import { Router } from 'express';
import { accountController } from '../controllers/accountController';

const router = Router();

router.get('/:id', accountController.getById);
router.get('/:id/balance', accountController.getBalance);
router.get('/:id/transactions', accountController.listTransactions);
router.post('/:id/deposit', accountController.deposit);
router.post('/:id/withdraw', accountController.withdraw);
router.post('/:id/transfer', accountController.transfer);

export { router as accountRoutes };
