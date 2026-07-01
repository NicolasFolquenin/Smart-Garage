const mysql2 = require('mysql2');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectModule: mysql2,
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: true,
        freezeTableName: true
    },
    logging: false

});

module.exports = { Sequelize, sequelize };
