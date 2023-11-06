import jwt from 'jsonwebtoken';
import { apiResponse } from '../utils/apiResponse'
const { Op } = require("sequelize");
import { User } from '../models/User';
// import { Request, Response } from 'express';
export default () =>
  async function (req: any, res: any, next: any) {
    // Get token from header
    let token: any;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return apiResponse(
        res,
        401,
        false,
        "You are not logged in, please login to get access",
        null
      );
    }
    // Verify token
    try {
      let decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user = null;
      user = await User.findOne({
        where: {
          id: decoded.userId,
        },
      });
      if (!user) {
        return apiResponse(
          res,
          400,
          false,
          `User for this token does'nt exist anymore.`,
          null
        );
      }
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      return apiResponse(
        res,
        400,
        false,
        error.message ? error.message : `Token is invalid`,
        error
      );
    }
  };
