const db = require('../db');

const Estado = db.sequelize.define('estado', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    uf: {
        type: db.Sequelize.STRING(2),
        allowNull: false
    }
});

module.exports = Estado;