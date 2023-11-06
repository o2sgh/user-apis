"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const apiResponse_1 = require("../utils/apiResponse");
const validationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push(err.msg));
    return (0, apiResponse_1.apiResponse)(res, 400, false, extractedErrors[0], null);
};
exports.default = validationErrors;
//# sourceMappingURL=validations.js.map