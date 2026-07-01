const db = require('../db');

const Modelo = db.sequelize.define('modelo', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    }
});

module.exports = Modelo;