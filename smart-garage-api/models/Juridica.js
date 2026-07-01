const db = require('../db');

const Juridica = db.sequelize.define('juridica', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cnpj: {
        type: db.Sequelize.STRING(14),
        allowNull: false,
        unique: 'cnpj_unique_idx'
    },
    nome_responsavel: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },
    razao_social: {
        type: db.Sequelize.STRING(50),
        unique: 'razao_social_unique_idx',
        defaultValue: null
    }
});

module.exports = Juridica;