const db = require('../db');

const Comissao = db.sequelize.define('comissao', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    valor_minimo: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    valor_maximo: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: true // Nulo para a faixa "acima de"
    },
    valor_comissao: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = Comissao;