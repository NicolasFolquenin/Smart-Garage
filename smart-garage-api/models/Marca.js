const db = require('../db');

const Marca = db.sequelize.define('marca', {
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


module.exports = Marca;