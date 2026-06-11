import { Router } from 'express';
import { authController } from './auth.controller';
import { checkAuth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { authValidation } from './auth.validation';

const router = Router();

router.post('/signup', validateRequest(authValidation.signUp), authController.signUpUser);
router.post("/send-verification-email", validateRequest(authValidation.emailValidation), authController.sendVerificationEmail);
router.post('/verify-email', validateRequest(authValidation.verifyEmail), authController.verifyEmail);
router.post('/login', validateRequest(authValidation.login), authController.loginUser);
router.get('/me', checkAuth(), authController.getMe);
router.post('/refresh-token', authController.getNewToken);
router.post('/logout', authController.logoutUser);
router.post('/forgot-password', validateRequest(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validateRequest(authValidation.resetPassword), authController.resetPassword);
router.post('/change-password', checkAuth(), validateRequest(authValidation.changePassword), authController.changePassword);
router.put('/me', checkAuth(), validateRequest(authValidation.updateProfile), authController.updateProfile);
router.get('/sessions', checkAuth(), authController.getMySessions);
router.post('/sessions/revoke', checkAuth(), validateRequest(authValidation.revokeSession), authController.revokeSession);

export const authRoutes = router;
