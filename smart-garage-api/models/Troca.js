const db = require("../db");

const Troca = db.sequelize.define("troca", {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    comissao: {
        type: db.Sequelize.DECIMAL(8, 2),
        allowNull: false
    },
    data: {
        type: db.Sequelize.DATEONLY,
        allowNull: false
    },
    forma_pagamento: {
        type: db.Sequelize.ENUM('Cartão', 'Dinheiro', 'Financiamento', 'Pix'),
        allowNull: true
    },
    valor: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: true
    },
    valor_aquisicao: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: true
    },
    automovel_fornecido: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Troca;