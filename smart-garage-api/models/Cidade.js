const db = require('../db');

const Cidade = db.sequelize.define('cidade', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    nome: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    }
});

module.exports = Cidade;