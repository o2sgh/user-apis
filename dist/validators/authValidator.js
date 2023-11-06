"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const authValidator = {
    signupValidator: [
        (0, express_validator_1.body)('email').isLength({ min: 8 })
            .withMessage('email is required').isEmail().withMessage('Invalid email address'),
        (0, express_validator_1.body)('userName').notEmpty().withMessage('name is required'),
        (0, express_validator_1.body)('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 'g')
            .withMessage('Password must contain at least one lower, one upper, one digit, and one special character'),
        (0, express_validator_1.body)('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    ],
    loginValidator: [
        (0, express_validator_1.body)('email').notEmpty()
            .withMessage('email is required').isEmail().withMessage('Invalid email address'),
        (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    ],
    verifyEmailValidator: [
        (0, express_validator_1.body)('encryptedToken').notEmpty()
            .withMessage('Token is required'),
    ],
    googleLoginValidator: [
        (0, express_validator_1.body)('googleToken').notEmpty()
            .withMessage('Token is required'),
    ],
    updateProfileValidator: [
        (0, express_validator_1.body)('userName').notEmpty()
            .withMessage('name is required'),
    ],
    resetPasswordValidator: [
        (0, express_validator_1.body)('oldPassword').notEmpty().withMessage('Old password is required'),
        (0, express_validator_1.body)('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 'g')
            .withMessage('Password must contain at least one lower, one upper, one digit, and one special character'),
        (0, express_validator_1.body)('reEnterPassword').notEmpty().withMessage('please re-enter password').custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    ]
};
exports.default = authValidator;
//# sourceMappingURL=authValidator.js.map