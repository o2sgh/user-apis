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
const email_1 = __importDefault(require("../utils/email"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const User_1 = require("../models/User");
const authController = {
    signup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let { email, password, userName } = req.body;
            let user = yield User_1.User.scope("withSecretColumns").findOne({
                where: {
                    email
                }
            });
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            const encryptedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
            if (user && user.emailVerified) {
                return (0, apiResponse_1.apiResponse)(res, 400, false, `Email already exists`, null);
            }
            else if (user && !user.emailVerified) {
                user.emailVerificationLink = encryptedToken;
                user.emailVerificationLinkExpiredAt = new Date(Date.now() + 10 * 60 * 1000);
                yield user.save();
            }
            else {
                password = yield bcrypt_1.default.hash(password, 10);
                user = yield User_1.User.create({
                    email,
                    userName,
                    password,
                    isProfileCompleted: false,
                    emailVerified: false,
                    emailVerificationLink: encryptedToken,
                    totalNumberOfLogin: 0,
                    emailVerificationLinkExpiredAt: new Date(Date.now() + 10 * 60 * 1000)
                });
            }
            (0, email_1.default)({
                email,
                subject: "Email Verification Link",
                message: `To verify your email, please click on the link: https://demo-app-git-main-rehannaveeds-projects.vercel.app/email-verifying/${resetToken}`,
            });
            return (0, apiResponse_1.apiResponse)(res, 200, true, "Verification link has been sent to your email, please verify that link", null);
        }
        catch (error) {
            return (0, apiResponse_1.apiResponse)(res, 500, false, error.message ? error.message : `Something went wrong`, null);
        }
    }),
    verifyEmail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let { encryptedToken } = req.body;
            const hashedToken = crypto_1.default.createHash('sha256').update(encryptedToken).digest('hex');
            let user = yield User_1.User.scope("withSecretColumns").findOne({
                where: {
                    emailVerificationLink: hashedToken,
                    emailVerificationLinkExpiredAt: {
                        [sequelize_1.Op.gt]: Date.now()
                    }
                }
            });
            if (!user) {
                return (0, apiResponse_1.apiResponse)(res, 404, false, `Token is invalid or expired`, null);
            }
            yield user.update({
                emailVerificationLink: null,
                emailVerificationLinkExpiredAt: null,
                emailVerified: true,
                isProfileCompleted: true,
                lastLoginAt: new Date(),
                totalNumberOfLogin: 1
            });
            user.emailVerificationLink = undefined;
            user.emailVerificationLinkExpiredAt = undefined;
            user.password = undefined;
            let token = user.generateToken();
            return (0, apiResponse_1.apiResponse)(res, 200, true, "Login successful", { user, token });
        }
        catch (error) {
            return (0, apiResponse_1.apiResponse)(res, 500, false, error.message ? error.message : `Something went wrong`, error);
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let { email, password } = req.body;
            const authenticateRes = yield User_1.User.authenticate(email, password);
            if (!authenticateRes.status) {
                return (0, apiResponse_1.apiResponse)(res, 400, false, authenticateRes.message, null);
            }
            let user = authenticateRes.data;
            if (!user.emailVerified || !user.isProfileCompleted) {
                return (0, apiResponse_1.apiResponse)(res, 400, false, "Email is not verified. Please verify your email", null);
            }
            const token = user.generateToken();
            user.lastLoginAt = new Date();
            user.totalNumberOfLogin = user.totalNumberOfLogin ? user.totalNumberOfLogin + 1 : 1;
            yield user.save();
            user.password = undefined;
            return (0, apiResponse_1.apiResponse)(res, 200, true, "Login successful", { user, token });
        }
        catch (error) {
            return (0, apiResponse_1.apiResponse)(res, 500, false, error.message ? error.message : `Something went wrong`, error);
        }
    }),
    google: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let { googleToken } = req.body;
            let profile = jsonwebtoken_1.default.decode(googleToken);
            if (!profile) {
                return (0, apiResponse_1.apiResponse)(res, 400, false, "No google profile found with this email", null);
            }
            let user = yield User_1.User.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        {
                            googleId: profile.sub
                        },
                        {
                            email: profile.email,
                        },
                    ],
                },
            });
            if (user) {
                user.googleId = profile.sub;
                user.userName = profile.name;
            }
            else {
                user = yield User_1.User.create({
                    userName: profile.name,
                    email: profile.email,
                    googleId: profile.sub,
                    emailVerified: profile.email_verified,
                    isProfileCompleted: true,
                });
            }
            user.lastLoginAt = new Date();
            user.totalNumberOfLogin = user.totalNumberOfLogin ? user.totalNumberOfLogin + 1 : 1;
            const token = user.generateToken();
            yield user.save();
            return (0, apiResponse_1.apiResponse)(res, 200, true, 'Login successful', { user, token });
        }
        catch (error) {
            return (0, apiResponse_1.apiResponse)(res, 500, false, error.message ? error.message : `Something went wrong`, error);
        }
    }),
    resetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let { oldPassword, newPassword } = req.body;
            let user = yield User_1.User.scope('withSecretColumns').findOne({
                where: {
                    id: req.user.id
                }
            });
            let passwordCompared = yield bcrypt_1.default.compare(oldPassword, user.password);
            if (passwordCompared) {
                newPassword = yield bcrypt_1.default.hash(newPassword, 10);
                yield user.update({
                    password: newPassword,
                });
                user.password = undefined;
                return (0, apiResponse_1.apiResponse)(res, 200, true, "Password reset successfully", null);
            }
            else {
                return (0, apiResponse_1.apiResponse)(res, 400, false, "current password is wrong", null);
            }
        }
        catch (error) {
            return (0, apiResponse_1.apiResponse)(res, 500, false, error.message ? error.message : `Something went wrong`, error);
        }
    }),
    getProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return (0, apiResponse_1.apiResponse)(res, 200, true, `User profile found`, req.user);
        }
        catch (error) {
            return (0, apiResponse_1.apiResponse)(res, 500, false, error.message ? error.message : `Something went wrong`, error);
        }
    }),
    verifySession: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let token = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImY1ZjRiZjQ2ZTUyYjMxZDliNjI0OWY3MzA5YWQwMzM4NDAwNjgwY2QiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NjUxODM1NjEyNzgtOXFpc3J2aTBkN2dzMDM0MjJnYXV2NzI3b3ZnajhnYXEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3NjUxODM1NjEyNzgtOXFpc3J2aTBkN2dzMDM0MjJnYXV2NzI3b3ZnajhnYXEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTE1MDU5MzI2NDQwMzM2MzU2NDAiLCJlbWFpbCI6InNvZnRjaXJjbGVzMDAxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE2OTg5MjUzMDQsIm5hbWUiOiJTb2Z0IENpcmNsZXMiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSV9QQ2lwa2lWdUpPSUZaNC16SUNwczh5QWstdElBb09UWWZ5cTdKN2hKPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlNvZnQiLCJmYW1pbHlfbmFtZSI6IkNpcmNsZXMiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTY5ODkyNTYwNCwiZXhwIjoxNjk4OTI5MjA0LCJqdGkiOiJjMjUyNzlhYWUwMTIzYzU0ZjQzMjEzMjQ4MDU1YmU5YmNjNzNlNjcxIn0.VI3-_M8MyjhPpC4wvuDmWFu-8sCn-eFmZUM8t1xKGtPGVB6idWjjBkVK35iy9uHeMl6HnqLnA4YO5IrNCPr-0oLmp3zvCX9gQtV2_AtLHAgD87J9-gqx9I2HbsjC9eEU9fepZijE8QmrwsmaHRoJapHtcNcNO0dRU6qdkdgv_HzsRKmNctlnv3512vX4MCb0iw2Ttgh13Jc37GUuCBswKdShFFPpEwadfozCFwM3qaMDZv9_zGTT5pbWVbXN0veavFZIGP8aBRxKnHFQB3aFIqxgZD2Fegsw755BT_fDewWdcwGtmmT5qAvVKCA7ERGfc_kcnTk9ZhujBtnBL---6A";
            let user = jsonwebtoken_1.default.decode(token);
            return (0, apiResponse_1.apiResponse)(res, 400, false, `Session is invalid or expired.`, null);
        }
        catch (error) {
            return (0, apiResponse_1.apiResponse)(res, 500, false, error.message ? error.message : `Something went wrong`, error);
        }
    }),
    updateProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let user = req.user;
            yield user.update({
                userName: req.body.userName
            });
            yield user.reload();
            return (0, apiResponse_1.apiResponse)(res, 200, true, `Updated successfully`, user);
        }
        catch (error) {
            return (0, apiResponse_1.apiResponse)(res, 500, false, error.message ? error.message : `Something went wrong`, error);
        }
    })
};
exports.default = authController;
//# sourceMappingURL=authController.js.map