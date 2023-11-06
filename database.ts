const { Sequelize } = require('sequelize-typescript');
const sequelize = new Sequelize({
    username: "root",
    password: "root",
    database: "backend_db_development",
    host: "localhost",
    dialect: "mysql"
});
export default sequelize;