"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const validations_1 = __importDefault(require("../validators/validations"));
const router = express_1.default.Router();
router.get('/get-dashboard-stats', (0, authMiddleware_1.default)(), validations_1.default, userController_1.default.getDashboardStats);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map