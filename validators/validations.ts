import { validationResult } from 'express-validator';
import { apiResponse } from '../utils/apiResponse';
const validationErrors = (req: Request, res: any, next: any) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push(err.msg));
    return apiResponse(res, 400, false, extractedErrors[0], null);
};

export default validationErrors;