"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const userValidator = {
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
exports.default = userValidator;
//# sourceMappingURL=userValidator.js.map