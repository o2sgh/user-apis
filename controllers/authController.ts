import { Request, Response } from 'express';
import { apiResponse } from '../utils/apiResponse'
import sendEmail from '../utils/email'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { Op } from "sequelize";
import { User } from '../models/User';
const authController = {

  signup: async (req: Request, res: Response) => {
    try {
      let { email, password, userName } = req.body
      let user = await User.scope("withSecretColumns").findOne({
        where: {
          email
        }
      });
      const resetToken = crypto.randomBytes(32).toString('hex');
      const encryptedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
      if (user && user.emailVerified) {
        return apiResponse(
          res,
          400,
          false,
          `Email already exists`,
          null
        );
      }
      else if (user && !user.emailVerified) {
        user.emailVerificationLink = encryptedToken;
        user.emailVerificationLinkExpiredAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save()
      }
      else {
        password = await bcrypt.hash(password, 10);
        user = await User.create(
          {
            email,
            userName,
            password,
            isProfileCompleted: false,
            emailVerified: false,
            emailVerificationLink: encryptedToken,
            totalNumberOfLogin: 0,
            emailVerificationLinkExpiredAt: new Date(Date.now() + 10 * 60 * 1000)
          }
        );
      }
      sendEmail({
        email,
        subject: "Email Verification Link",
        message: `To verify your email, please click on the link: http://localhost:3000/email-verifying/${resetToken}`,
      });
      return apiResponse(res, 200, true, "Verification link has been sent to your email, please verify that link", null)
    } catch (error) {
      return apiResponse(res, 500, false, error.message ? error.message : `Something went wrong`, null)
    }

  },

  verifyEmail: async (req: Request, res: Response) => {
    try {
      let { encryptedToken } = req.body;
      const hashedToken = crypto.createHash('sha256').update(encryptedToken).digest('hex')
      let user = await User.scope("withSecretColumns").findOne({
        where: {
          emailVerificationLink: hashedToken,
          emailVerificationLinkExpiredAt: {
            [Op.gt]: Date.now()
          }
        }
      })
      if (!user) {
        return apiResponse(res, 404, false, `Token is invalid or expired`, null)
      }
      await user.update({
        emailVerificationLink: null,
        emailVerificationLinkExpiredAt: null,
        emailVerified: true,
        isProfileCompleted: true,
        lastLoginAt: new Date(),
        totalNumberOfLogin: 1
      })
      user.emailVerificationLink = undefined;
      user.emailVerificationLinkExpiredAt = undefined;
      user.password = undefined;
      let token = user.generateToken();
      return apiResponse(res, 200, true, "Login successful", { user, token });
    } catch (error) {
      return apiResponse(
        res,
        500,
        false,
        error.message ? error.message : `Something went wrong`,
        error
      );
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      let { email, password } = req.body;
      const authenticateRes = await User.authenticate(email, password);
      if (!authenticateRes.status) {
        return apiResponse(res, 400, false, authenticateRes.message, null);
      }
      let user = authenticateRes.data;
      if (!user.emailVerified || !user.isProfileCompleted) {
        return apiResponse(res, 400, false, "Email is not verified. Please verify your email", null)
      }
      const token = user.generateToken();
      user.lastLoginAt = new Date()
      user.totalNumberOfLogin = user.totalNumberOfLogin ? user.totalNumberOfLogin + 1 : 1;
      await user.save()
      user.password = undefined;
      return apiResponse(res, 200, true, "Login successful", { user, token });
    } catch (error) {
      return apiResponse(
        res,
        500,
        false,
        error.message ? error.message : `Something went wrong`,
        error
      );
    }
  },

  google: async (req: Request, res: Response, next: any) => {
    try {
      let { googleToken } = req.body
      let profile = jwt.decode(googleToken)
      if (!profile) {
        return apiResponse(
          res,
          400,
          false,
          "No google profile found with this email",
          null
        );
      }
      let user = await User.findOne({
        where: {
          [Op.or]: [
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
      } else {
        user = await User.create({
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
      await user.save();
      return apiResponse(res, 200, true, 'Login successful', { user, token });
    } catch (error) {
      return apiResponse(
        res,
        500,
        false,
        error.message ? error.message : `Something went wrong`,
        error
      );
    }
  },

  resetPassword: async (req: any, res: Response) => {
    try {
      let { oldPassword, newPassword } = req.body;
      let user = await User.scope('withSecretColumns').findOne({
        where: {
          id: req.user.id
        }
      });
      let passwordCompared = await bcrypt.compare(oldPassword, user.password);
      if (passwordCompared) {
        newPassword = await bcrypt.hash(newPassword, 10);
        await user.update({
          password: newPassword,
        });
        user.password = undefined;
        return apiResponse(res, 200, true, "Password reset successfully", null);
      } else {
        return apiResponse(res, 400, false, "current password is wrong", null);
      }
    } catch (error) {
      return apiResponse(
        res,
        500,
        false,
        error.message ? error.message : `Something went wrong`,
        error
      );
    }
  },

  getProfile: async (req: any, res: Response) => {
    try {
      return apiResponse(res, 200, true, `User profile found`, req.user);
    } catch (error) {
      return apiResponse(
        res,
        500,
        false,
        error.message ? error.message : `Something went wrong`,
        error
      );
    }
  },

  verifySession: async (req: any, res: Response) => {
    try {
      let token = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImY1ZjRiZjQ2ZTUyYjMxZDliNjI0OWY3MzA5YWQwMzM4NDAwNjgwY2QiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NjUxODM1NjEyNzgtOXFpc3J2aTBkN2dzMDM0MjJnYXV2NzI3b3ZnajhnYXEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3NjUxODM1NjEyNzgtOXFpc3J2aTBkN2dzMDM0MjJnYXV2NzI3b3ZnajhnYXEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTE1MDU5MzI2NDQwMzM2MzU2NDAiLCJlbWFpbCI6InNvZnRjaXJjbGVzMDAxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE2OTg5MjUzMDQsIm5hbWUiOiJTb2Z0IENpcmNsZXMiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSV9QQ2lwa2lWdUpPSUZaNC16SUNwczh5QWstdElBb09UWWZ5cTdKN2hKPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlNvZnQiLCJmYW1pbHlfbmFtZSI6IkNpcmNsZXMiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTY5ODkyNTYwNCwiZXhwIjoxNjk4OTI5MjA0LCJqdGkiOiJjMjUyNzlhYWUwMTIzYzU0ZjQzMjEzMjQ4MDU1YmU5YmNjNzNlNjcxIn0.VI3-_M8MyjhPpC4wvuDmWFu-8sCn-eFmZUM8t1xKGtPGVB6idWjjBkVK35iy9uHeMl6HnqLnA4YO5IrNCPr-0oLmp3zvCX9gQtV2_AtLHAgD87J9-gqx9I2HbsjC9eEU9fepZijE8QmrwsmaHRoJapHtcNcNO0dRU6qdkdgv_HzsRKmNctlnv3512vX4MCb0iw2Ttgh13Jc37GUuCBswKdShFFPpEwadfozCFwM3qaMDZv9_zGTT5pbWVbXN0veavFZIGP8aBRxKnHFQB3aFIqxgZD2Fegsw755BT_fDewWdcwGtmmT5qAvVKCA7ERGfc_kcnTk9ZhujBtnBL---6A";
      let user = jwt.decode(token)
      return apiResponse(
        res,
        400,
        false,
        `Session is invalid or expired.`,
        null
      );
    } catch (error) {
      return apiResponse(
        res,
        500,
        false,
        error.message ? error.message : `Something went wrong`,
        error
      );
    }
  },

  updateProfile: async (req: any, res: Response) => {
    try {
      let user = req.user
      await user.update({
        userName: req.body.userName
      });
      await user.reload();
      return apiResponse(res, 200, true, `Updated successfully`, user);
    } catch (error) {
      return apiResponse(
        res,
        500,
        false,
        error.message ? error.message : `Something went wrong`,
        error
      );
    }
  }
}

export default authController;