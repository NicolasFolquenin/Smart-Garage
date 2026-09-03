/**
 * Script para ajustar a coluna email na tabela cliente do banco de dados MySQL
 * Torna a coluna opcional (NULL).
 * 
 * Uso: node tornar-email-opcional.js
 */

require('dotenv').config();
const { sequelize } = require('./db');

async function ajustarColunaEmail() {
    try {
        console.log("Conectando ao banco de dados e ajustando a coluna 'email'...");

        await sequelize.query("ALTER TABLE cliente MODIFY COLUMN email VARCHAR(50) NULL;");

        console.log(" Sucesso! A coluna 'email' da tabela 'cliente' agora aceita valores NULL (opcional).");
    } catch (error) {
        console.error("❌ Erro ao alterar coluna no banco de dados:", error.message);
    } finally {
        await sequelize.close();
    }
}

ajustarColunaEmail();
