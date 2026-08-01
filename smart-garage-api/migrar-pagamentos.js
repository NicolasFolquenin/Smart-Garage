/**
 * Script de Migração: forma_pagamento (campo único) → pagamento_venda (tabela 1:N)
 * 
 * Este script migra os dados de vendas existentes que possuem o campo
 * forma_pagamento preenchido diretamente na tabela venda para a nova
 * tabela pagamento_venda.
 * 
 * SEGURO: Apenas INSERE dados na nova tabela. NÃO altera nem remove
 * dados existentes.
 * 
 * Uso: node migrar-pagamentos.js
 */

require('dotenv').config();
const db = require('./models/index');

async function migrar() {
    try {
        // Sincronizar para garantir que a tabela pagamento_venda existe
        await db.sequelize.sync({ force: false });

        console.log("===========================================");
        console.log("  MIGRAÇÃO: forma_pagamento → pagamento_venda");
        console.log("===========================================\n");

        // Buscar todas as vendas
        const vendas = await db.Venda.findAll({
            include: [
                { model: db.PagamentoVenda, as: 'pagamento_vendas' }
            ]
        });

        console.log(`Total de vendas encontradas: ${vendas.length}\n`);

        let migradas = 0;
        let jaExistentes = 0;
        let semFormaPagamento = 0;

        for (const venda of vendas) {
            // Se já tem pagamentos na nova tabela, pular
            if (venda.pagamento_vendas && venda.pagamento_vendas.length > 0) {
                jaExistentes++;
                console.log(`  [SKIP] Venda #${venda.id} - Já possui ${venda.pagamento_vendas.length} pagamento(s)`);
                continue;
            }

            // Se não tem forma_pagamento no campo antigo, pular
            if (!venda.forma_pagamento) {
                semFormaPagamento++;
                console.log(`  [SKIP] Venda #${venda.id} - Sem forma_pagamento no campo antigo`);
                continue;
            }

            // Migrar: criar registro na nova tabela
            await db.PagamentoVenda.create({
                forma_pagamento: venda.forma_pagamento,
                valor: venda.valor,
                observacao: 'Migrado automaticamente',
                vendaId: venda.id
            });

            migradas++;
            console.log(`  [OK] Venda #${venda.id} - ${venda.forma_pagamento} (R$ ${venda.valor})`);
        }

        console.log("\n===========================================");
        console.log("  RESULTADO DA MIGRAÇÃO");
        console.log("===========================================");
        console.log(`  ✅ Migradas:           ${migradas}`);
        console.log(`  ⏩ Já existentes:      ${jaExistentes}`);
        console.log(`  ⚠️  Sem forma antiga:   ${semFormaPagamento}`);
        console.log(`  📊 Total processadas:  ${vendas.length}`);
        console.log("===========================================\n");

        if (migradas > 0) {
            console.log("✅ Migração concluída com sucesso!");
            console.log("Os dados originais na tabela 'venda' NÃO foram alterados.");
        } else if (jaExistentes === vendas.length) {
            console.log("ℹ️  Todas as vendas já possuem pagamentos na nova tabela.");
        } else {
            console.log("ℹ️  Nenhuma venda precisou ser migrada.");
        }

    } catch (error) {
        console.error("\n❌ ERRO na migração:", error.message);
        console.error(error);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
}

migrar();
