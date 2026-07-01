const db = require('../db');

const Vendedor = db.sequelize.define('vendedor', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    }
});


module.exports = Vendedor;