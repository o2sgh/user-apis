import { Request, Response } from 'express';
import { apiResponse } from '../utils/apiResponse'
import moment from 'moment';
import { User } from '../models/User';
import { Op } from 'sequelize';
const userController = {
  getDashboardStats: async (req: Request, res: Response) => {
    try {
      let stats = {
        totalSignedUsers: 0,
        usersWithActiveSessions: 0,
        averageActiveSessionsWithinSevenDays: 0.0
      }
      let users = await User.findAll({
        where: {
          isProfileCompleted: true
        },
        attributes: ['id', 'lastLoginAt', 'totalNumberOfLogin', 'createdAt']
      })
      let usersWithActiveSessionToday = await User.count({
        where: {
          lastLoginAt: {
            [Op.gte]: moment().subtract(24, 'hours').toDate()
          }
        }
      })
      //calculate average users within seven days
      const currentDate = new Date();
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(currentDate.getDate() - 7);
      let totalUserSessionWithLastSevenDays = await User.count({
        where: {
          lastLoginAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
      })
      stats.totalSignedUsers = users.length
      stats.usersWithActiveSessions = usersWithActiveSessionToday
      stats.averageActiveSessionsWithinSevenDays = parseFloat((totalUserSessionWithLastSevenDays / 7).toFixed(2))
      return apiResponse(res, 200, true, "Dasboard stats", { users, stats })
    } catch (error) {
      return apiResponse(res, 500, false, error.message ? error.message : `Something went wrong`, null)
    }
  },
};
export default userController;