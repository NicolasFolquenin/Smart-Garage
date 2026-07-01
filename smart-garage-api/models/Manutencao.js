const db = require('../db');

const Manutencao = db.sequelize.define('manutencao', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        alloNull: false,
        autoIncrement: true
    },
    ativo: {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    data_envio: {
        type: db.Sequelize.DATEONLY,
        allowNull: false
    },
    data_retorno: {
        type: db.Sequelize.DATEONLY,
        defaultValue: null
    },
    descricao: {
        type: db.Sequelize.STRING(255)
    },
    previsao_retorno: {
        type: db.Sequelize.DATEONLY,
        defaultValue: null
    },
    valor: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = Manutencao;