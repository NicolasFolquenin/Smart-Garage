const db = require('../db');

const Automovel = db.sequelize.define('automovel', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    ano_fabricacao: {
        type: db.Sequelize.INTEGER(4),
        allowNull: false
    },
    ano_modelo: {
        type: db.Sequelize.INTEGER(4),
        allowNull: false
    },
    ativo: {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    cor: {
        type: db.Sequelize.STRING(30),
        allowNull: false
    },
    combustivel: {
        type: db.Sequelize.ENUM('Diesel', 'Elétrico', 'Etanol', 'Flex', 'Gasolina', "Híbrido"),
        allowNull: false
    },
    km: {
        type: db.Sequelize.STRING(10),
        allowNull: false
    },
    origem: {
        type: db.Sequelize.ENUM('Compra', 'Consignacao', 'Troca'),
        allowNull: false
    },
    placa: {
        type: db.Sequelize.STRING(7),
        allowNull: false,
        unique: 'placa_unique_idx'
    },
    renavam: {
        type: db.Sequelize.STRING(11),
        allowNull: false,
        unique: 'renavam_unique_idx'
    },
    valor: {
        type: db.Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    imagem: {
        type: db.Sequelize.STRING
    }
});


module.exports = Automovel;