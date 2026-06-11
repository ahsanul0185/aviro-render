import { Router } from 'express';
import { userController } from './user.controller';

const router = Router();

router.get('/:identifier', userController.getUserByIdOrUsername);

export const userRoutes = router;
