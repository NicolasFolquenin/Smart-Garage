/**
 * Script de Ajuste no Banco de Dados:
 * 1. Adiciona a coluna custo_aquisicao na tabela automovel
 * 2. Adiciona a opção 'Estoque Inicial' no ENUM da coluna origem na tabela automovel
 * 
 * Uso: node ajustar-estoque-inicial.js
 */

require('dotenv').config();
const { sequelize } = require('./db');

async function ajustarEstoqueInicial() {
    try {
        console.log("Conectando ao banco de dados...");

        // 1. Verificar se a coluna custo_aquisicao já existe
        const [colunas] = await sequelize.query(`
            SHOW COLUMNS FROM automovel LIKE 'custo_aquisicao';
        `);

        if (colunas.length === 0) {
            console.log("Adicionando coluna 'custo_aquisicao' na tabela 'automovel'...");
            await sequelize.query(`
                ALTER TABLE automovel ADD COLUMN custo_aquisicao DECIMAL(10, 2) NULL AFTER valor;
            `);
            console.log("✅ Coluna 'custo_aquisicao' adicionada com sucesso!");
        } else {
            console.log("ℹ️ Coluna 'custo_aquisicao' já existe na tabela 'automovel'.");
        }

        // 2. Atualizar o ENUM da coluna origem para aceitar 'Estoque Inicial'
        console.log("Atualizando ENUM da coluna 'origem' para incluir 'Estoque Inicial'...");
        await sequelize.query(`
            ALTER TABLE automovel MODIFY COLUMN origem ENUM('Compra', 'Consignacao', 'Troca', 'Estoque Inicial') NOT NULL;
        `);
        console.log("✅ ENUM de 'origem' atualizado com sucesso!");

        console.log("\n🎉 Migração concluída com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao executar migração:", error.message);
    } finally {
        await sequelize.close();
    }
}

ajustarEstoqueInicial();
