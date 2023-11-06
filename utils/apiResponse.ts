import { Response } from 'express';

export const apiResponse = (res: Response, statusCode: number, status: boolean, message: string, data: any) => {
    return res.status(statusCode).json({ status, message, data });
};
