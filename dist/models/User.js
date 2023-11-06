"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let User = User_1 = class User extends sequelize_typescript_1.Model {
    // Static method to authenticate a user
    static authenticate(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.scope('withSecretColumns').findOne({
                where: {
                    email,
                },
            });
            if (!user || !user.password) {
                return {
                    status: false,
                    message: 'No user found with this email',
                };
            }
            const passwordCompared = yield bcrypt_1.default.compare(password, user.password);
            if (passwordCompared) {
                return {
                    status: true,
                    data: user,
                };
            }
            return {
                status: false,
                message: 'Password incorrect',
            };
        });
    }
    generateToken() {
        const userId = this.id;
        const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        return token;
    }
};
exports.User = User;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    })
], User.prototype, "userName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: "Must be a valid email address",
            }
        }
    })
], User.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    })
], User.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    })
], User.prototype, "googleId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    })
], User.prototype, "emailVerificationLink", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    })
], User.prototype, "emailVerificationLinkExpiredAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
    })
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: false
    })
], User.prototype, "isProfileCompleted", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: false
    })
], User.prototype, "emailVerified", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.NUMBER,
    })
], User.prototype, "totalNumberOfLogin", void 0);
exports.User = User = User_1 = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'User',
        defaultScope: {
            attributes: { exclude: ["password", "emailVerificationLink", "emailVerificationLinkExpiredAt"] },
        },
        scopes: {
            withSecretColumns: {
                attributes: { include: ["password", "emailVerificationLink", "emailVerificationLinkExpiredAt"] },
            },
        }
    })
], User);
database_1.default.addModels([User]);
//# sourceMappingURL=User.js.map