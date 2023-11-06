"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiResponse = void 0;
const apiResponse = (res, statusCode, status, message, data) => {
    return res.status(statusCode).json({ status, message, data });
};
exports.apiResponse = apiResponse;
//# sourceMappingURL=apiResponse.js.map