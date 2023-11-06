"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiResponse_1 = require("../utils/apiResponse");
const moment_1 = __importDefault(require("moment"));
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const userController = {
    getDashboardStats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let stats = {
                totalSignedUsers: 0,
                usersWithActiveSessions: 0,
                averageActiveSessionsWithinSevenDays: 0.0
            };
            let users = yield User_1.User.findAll({
                where: {
                    isProfileCompleted: true
                },
                attributes: ['id', 'lastLoginAt', 'totalNumberOfLogin', 'createdAt']
            });
            let usersWithActiveSessionToday = yield User_1.User.count({
                where: {
                    lastLoginAt: {
                        [sequelize_1.Op.gte]: (0, moment_1.default)().subtract(24, 'hours').toDate()
                    }
                }
            });
            //calculate average users within seven days
            const currentDate = new Date();
            const sevenDaysAgo = new Date(currentDate);
            sevenDaysAgo.setDate(currentDate.getDate() - 7);
            let totalUserSessionWithLastSevenDays = yield User_1.User.count({
                where: {
                    lastLoginAt: {
                        [sequelize_1.Op.gte]: sevenDaysAgo,
                    },
                },
            });
            stats.totalSignedUsers = users.length;
            stats.usersWithActiveSessions = usersWithActiveSessionToday;
            stats.averageActiveSessionsWithinSevenDays = parseFloat((totalUserSessionWithLastSevenDays / 7).toFixed(2));
            return (0, apiResponse_1.apiResponse)(res, 200, true, "Dasboard stats", { users, stats });
        }
        catch (error) {
            return (0, apiResponse_1.apiResponse)(res, 500, false, error.message ? error.message : `Something went wrong`, null);
        }
    }),
};
exports.default = userController;
//# sourceMappingURL=userController.js.map