const { Sequelize } = require('sequelize-typescript');
import dotenv from 'dotenv'
dotenv.config()
const sequelize = new Sequelize({
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
});
export default sequelize;