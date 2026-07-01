require('dotenv').config();

const bcrypt = require('bcryptjs');
const Entidade = require('./models/index');
const { sequelize } = require('./db');

const usuariosIniciais = [
    {
        nome: "Administrador",
        email: "admin@smartgarage.com",
        telefone: "11999999999",
        usuario: "admin",
        senha: "umaSenhaForteAdmin123" // Senha temporária 
    },
    {
        nome: "Gerente da Garagem",
        email: "gerente@smartgarage.com",
        telefone: "11888888888",
        usuario: "gerente",
        senha: "outraSenhaForteGerente456" // Senha temporária
    }
];

const criarGerentes = async () => {
    console.log("Iniciando a criação dos utilizadores iniciais...");

    const t = await sequelize.transaction();
    try {
        for (const userData of usuariosIniciais) {
            console.log(`- Criando utilizador: ${userData.usuario}...`);

            const senhaHash = await bcrypt.hash(userData.senha, 10);

            const novoFuncionario = await Entidade.Funcionario.create({
                nome: userData.nome,
                email: userData.email,
                telefone: userData.telefone,
                usuario: userData.usuario,
                senha: senhaHash,
                data_cadastro: new Date(),
                precisa_alterar_senha: true
            }, { transaction: t });

            await Entidade.Gerente.create({ funcionarioId: novoFuncionario.id }, { transaction: t });
        }

        await t.commit();
        console.log("SUCESSO: Todos os utilizadores gerentes foram criados.");

    } catch (error) {
        await t.rollback();
        console.error("FALHA: Erro ao criar os utilizadores iniciais.", error);
    } finally {

        await sequelize.close();
    }
};

// Executa a função
criarGerentes();