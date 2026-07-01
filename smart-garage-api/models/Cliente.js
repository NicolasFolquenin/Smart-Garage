const db = require('../db');

const Cliente = db.sequelize.define('cliente', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    ativo: {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    data_cadastro: {
        type: db.Sequelize.DATEONLY,
        allowNull: false
    },
    email: {
        type: db.Sequelize.STRING(50),
        allowNull: false,
        unique: 'email_unique_idx'
    },
    nome: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },
    telefone: {
        type: db.Sequelize.STRING(11),
        allowNull: false
    }
});

module.exports = Cliente;