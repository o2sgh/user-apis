const { DataTypes, QueryInterface } = require('sequelize');
let users = [
    {
        id: 1,
        email: "rehan.naveed@o2soft.com",
        password: "$2b$10$ngzKYuj8bQQ/rzyUHv1YR.tGJMz0xKe4x9hezuRz9mTndD5OItY/y",
        userName: "rehan.naveed",
        emailVerified: true,
        lastLoginAt: new Date(),
        totalNumberOfLogin: 1,
        isProfileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]
module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Your migration code
            await queryInterface.createTable('Users', {
                id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                },
                userName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                    validate: {
                        isEmail: {
                            msg: "Must be a valid email address",
                        }
                    }
                },

                emailVerified: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },

                password: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },

                googleId: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },

                emailVerificationLink: {
                    type: DataTypes.STRING,
                    allowNull: true
                },

                emailVerificationLinkExpiredAt: {
                    type: DataTypes.DATE,
                    allowNull: true
                },

                lastLoginAt: {
                    type: DataTypes.DATE
                },
                totalNumberOfLogin: {
                    type: DataTypes.INTEGER,
                },
                isProfileCompleted: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            });
            await queryInterface.bulkInsert('Users', users);
            return Promise.resolve()
        } catch (error) {
            return Promise.reject(error);
        }
    },
    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.dropTable('Users');
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
};