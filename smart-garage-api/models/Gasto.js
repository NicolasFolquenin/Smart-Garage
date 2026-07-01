const db = require('../db');

const Gasto = db.sequelize.define('gasto', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        alloNull: false,
        autoIncrement: true
    },
    data: {
        type: db.Sequelize.DATEONLY,
        allowNull: false
    },
    descricao: {
        type: db.Sequelize.STRING(255)
    },
    valor: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = Gasto;