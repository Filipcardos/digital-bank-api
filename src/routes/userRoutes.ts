import { Router } from 'express';
import { userController } from '../controllers/userController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.post('/', asyncHandler(userController.create));
router.get('/', userController.list);
router.get('/:id', userController.getById);
router.put('/:id', asyncHandler(userController.update));
router.patch('/:id', asyncHandler(userController.update));
router.delete('/:id', userController.delete);

export { router as userRoutes };
