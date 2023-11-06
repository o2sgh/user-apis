"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const authValidator_1 = __importDefault(require("../validators/authValidator"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const validations_1 = __importDefault(require("../validators/validations"));
const router = express_1.default.Router();
router.post('/login', authValidator_1.default.loginValidator, validations_1.default, authController_1.default.login);
router.post('/signup', authValidator_1.default.signupValidator, validations_1.default, authController_1.default.signup);
router.post('/verify-email', authValidator_1.default.verifyEmailValidator, validations_1.default, authController_1.default.verifyEmail);
router.post('/login-with-google', authValidator_1.default.googleLoginValidator, validations_1.default, authController_1.default.google);
router.get('/get-user-profile', (0, authMiddleware_1.default)(), authController_1.default.getProfile);
router.patch('/reset-password', (0, authMiddleware_1.default)(), authValidator_1.default.resetPasswordValidator, validations_1.default, authController_1.default.resetPassword);
router.patch('/update-profile', (0, authMiddleware_1.default)(), authValidator_1.default.updateProfileValidator, validations_1.default, authController_1.default.updateProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map