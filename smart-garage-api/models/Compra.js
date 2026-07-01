const db = require('../db');

const Compra = db.sequelize.define('compra', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    valor: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    data: {
        type: db.Sequelize.DATEONLY,
        allowNull: false
    }
});

module.exports = Compra;