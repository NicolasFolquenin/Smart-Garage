const db = require("../db");

const PagamentoVenda = db.sequelize.define("pagamento_venda", {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    forma_pagamento: {
        type: db.Sequelize.ENUM('Cartão', 'Dinheiro', 'Financiamento', 'Pix'),
        allowNull: false
    },
    valor: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    observacao: {
        type: db.Sequelize.STRING,
        allowNull: true
    }
});

module.exports = PagamentoVenda;
