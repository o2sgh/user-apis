import express from 'express';
import authController from '../controllers/authController';
import authValidator from '../validators/authValidator';
import auth from '../middlewares/authMiddleware';
import validations from "../validators/validations";
const router = express.Router();

router.post('/login',
    authValidator.loginValidator,
    validations,
    authController.login);

router.post('/signup',
    authValidator.signupValidator,
    validations,
    authController.signup);


router.post('/verify-email',
    authValidator.verifyEmailValidator,
    validations,
    authController.verifyEmail);

router.post('/login-with-google',
    authValidator.googleLoginValidator,
    validations,
    authController.google)

router.get('/get-user-profile',
    auth(),
    authController.getProfile);

router.patch('/reset-password',
    auth(),
    authValidator.resetPasswordValidator,
    validations,
    authController.resetPassword);

router.patch('/update-profile',
    auth(),
    authValidator.updateProfileValidator,
    validations,
    authController.updateProfile);

export default router;
