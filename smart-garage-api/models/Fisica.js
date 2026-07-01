const db = require('../db');

const Fisica = db.sequelize.define('fisica', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cpf: {
        type: db.Sequelize.STRING(11),
        allowNull: false,
        unique: 'cpf_unique_idx'
    },
    rg: {
        type: db.Sequelize.STRING(13),
        defaultValue: null,
        unique: 'rg_unique_idx'
    }
});

module.exports = Fisica;