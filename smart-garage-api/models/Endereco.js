const db = require('../db');

const Endereco = db.sequelize.define('endereco', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    bairro: {
        type: db.Sequelize.STRING(30),
        allowNull: false
    },
    cep: {
        type: db.Sequelize.STRING(8),
        allowNull: false
    },
    logradouro: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },
    numero: {
        type: db.Sequelize.STRING(10),
        allowNull: false
    }
});

module.exports = Endereco;