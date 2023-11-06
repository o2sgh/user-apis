import express from 'express';
import userController from '../controllers/userController';
import auth from '../middlewares/authMiddleware';
import validations from "../validators/validations";
const router = express.Router();

router.get('/get-dashboard-stats',
    auth(),
    validations,
    userController.getDashboardStats);


export default router;
