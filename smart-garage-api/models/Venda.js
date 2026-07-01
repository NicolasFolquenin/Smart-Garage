const db = require("../db");

const Venda = db.sequelize.define("venda", {
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
        allowNull: false
    },
    valor: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    origem_automovel: {
        type: db.Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Venda;