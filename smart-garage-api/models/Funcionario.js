const db = require('../db');

const Funcionario = db.sequelize.define('funcionario', {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    data_cadastro: {
        type: db.Sequelize.DATEONLY,
        allowNull: false
    },
    nome: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },
    email: {
        type: db.Sequelize.STRING(60),
        allowNull: false,
        unique: 'email_funcionario_unique_idx',
    },
    senha: {
        type: db.Sequelize.STRING(60),
        allowNull: false
    },
    telefone: {
        type: db.Sequelize.STRING(11),
        allowNull: false
    },
    usuario: {
        type: db.Sequelize.STRING(50),
        allowNull: false,
        unique: 'usuario_unique_idx'
    },
    ativo: {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    resetPasswordToken: {
        type: db.Sequelize.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: db.Sequelize.DATE,
        allowNull: true
    },
    precisa_alterar_senha: {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = Funcionario;