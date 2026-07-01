const db = require('../db');

const Gerente = db.sequelize.define('gerente', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    }
});


module.exports = Gerente;