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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiResponse_1 = require("../utils/apiResponse");
const { Op } = require("sequelize");
const User_1 = require("../models/User");
// import { Request, Response } from 'express';
exports.default = () => function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get token from header
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return (0, apiResponse_1.apiResponse)(res, 401, false, "You are not logged in, please login to get access", null);
        }
        // Verify token
        try {
            let decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            let user = null;
            user = yield User_1.User.findOne({
                where: {
                    id: decoded.userId,
                },
            });
            if (!user) {
                return (0, apiResponse_1.apiResponse)(res, 400, false, `User for this token does'nt exist anymore.`, null);
            }
            req.user = user;
            next();
        }
        catch (error) {
            console.log(error);
            return (0, apiResponse_1.apiResponse)(res, 400, false, error.message ? error.message : `Token is invalid`, error);
        }
    });
};
//# sourceMappingURL=authMiddleware.js.map