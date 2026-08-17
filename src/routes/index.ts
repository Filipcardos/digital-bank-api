import { Router } from 'express';
import { userRoutes } from './userRoutes';
import { accountRoutes } from './accountRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/users', userRoutes);
router.use('/accounts', accountRoutes);

export { router as routes };
