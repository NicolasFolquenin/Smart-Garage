// Importa a conexão central do seu projeto que está na raiz
const { sequelize } = require('../db'); 

const Automovel = require('./Automovel');
const Marca = require('./Marca');
const Modelo = require('./Modelo');
const Venda = require('./Venda');
const Cliente = require('./Cliente');
const Fisica = require('./Fisica');
const Juridica = require('./Juridica');
const Endereco = require('./Endereco');
const Cidade = require('./Cidade');
const Estado = require('./Estado');
const Funcionario = require('./Funcionario');
const Consignacao = require('./Consignacao');
const Compra = require('./Compra');
const Troca = require('./Troca');
const Gasto = require('./Gasto');
const Manutencao = require('./Manutencao');
const Gerente = require('./Gerente');
const Vendedor = require('./Vendedor');
const Comissao = require('./Comissao');
const PagamentoVenda = require('./PagamentoVenda');

// RELAÇÃ0 1xN MARCA-AUTOMÓVEL
Marca.hasMany(Automovel);
Automovel.belongsTo(Marca);

// RELAÇÃO 1xN MARCA-MODELO
Marca.hasMany(Modelo);
Modelo.belongsTo(Marca);

// RELAÇÃO 1X1 AUTOMOVEL-MODELO
Modelo.hasOne(Automovel);
Automovel.belongsTo(Modelo);

// RELAÇÃO 1X1 VENDA-AUTOMÓVEL
Automovel.hasOne(Venda);
Venda.belongsTo(Automovel);

// RELAÇÃO 1X1 VENDA-CLIENTE
Cliente.hasOne(Venda);
Venda.belongsTo(Cliente);

// RELAÇÃO 1X1 CLIENTE-FISICA
Cliente.hasOne(Fisica);
Fisica.belongsTo(Cliente);

// RELAÇÃO 1X1 CLIENTE-JURIDICA
Cliente.hasOne(Juridica);
Juridica.belongsTo(Cliente);

// RELAÇÃO 1X1 CLIENTE-ENDERECO
Cliente.hasOne(Endereco);
Endereco.belongsTo(Cliente);

// RELAÇÃO 1XN CIDADE-ENDERECO
Cidade.hasMany(Endereco);
Endereco.belongsTo(Cidade);

// RELAÇÃO 1X1 CIDADE-ESTADO
Estado.hasOne(Cidade);
Cidade.belongsTo(Estado);

// RELAÇÃO 1X1 FUNCIONARIO-VENDA
Funcionario.hasOne(Venda);
Venda.belongsTo(Funcionario);

// RELAÇÃO 1X1 FUNCIONARIO-CONSIGNACAO
Funcionario.hasOne(Consignacao);
Consignacao.belongsTo(Funcionario);

// RELAÇÃO 1X1 CLIENTE-CONSIGNACAO
Cliente.hasOne(Consignacao);
Consignacao.belongsTo(Cliente);

// RELAÇÃO 1X1 AUTOMOVEL-CONSIGNACAO
Automovel.hasOne(Consignacao);
Consignacao.belongsTo(Automovel);

// RELAÇÃO 1X1 COMPRA-AUTOMOVEL
Automovel.hasOne(Compra);
Compra.belongsTo(Automovel);

// RELAÇÃO 1X1 COMPRA-CLIENTE
Cliente.hasOne(Compra);
Compra.belongsTo(Cliente);

// RELAÇÃO 1X1 TROCA-CLIENTE
Cliente.hasOne(Troca);
Troca.belongsTo(Cliente);

// RELAÇÃO 1X1 TROCA-FUNCIONARIO
Funcionario.hasOne(Troca);
Troca.belongsTo(Funcionario);

// RELAÇÃO 1X1 TROCA-AUTOMOVEL
Automovel.hasOne(Troca);
Troca.belongsTo(Automovel);

// RELAÇÃO 1XN AUTOMOVEL-GASTO
Automovel.hasMany(Gasto);
Gasto.belongsTo(Automovel);

// RELAÇÃO 1XN AUTOMOVEL-MANUTENCAO
Automovel.hasMany(Manutencao);
Manutencao.belongsTo(Automovel);

// RELAÇÃO 1X1 FUNCIONARIO-GERENTE
Funcionario.hasOne(Gerente);
Gerente.belongsTo(Funcionario);

// RELAÇÃO 1X1 FUNCIONARIO-VENDEDOR
Funcionario.hasOne(Vendedor);
Vendedor.belongsTo(Funcionario);

// RELAÇÃO 1XN VENDA-PAGAMENTOVENDA
Venda.hasMany(PagamentoVenda);
PagamentoVenda.belongsTo(Venda);

module.exports = {
    sequelize, // <--- ADICIONADO AQUI! Agora o index.js da raiz consegue ler o .sync()
    Automovel,
    Marca,
    Modelo,
    Venda,
    Cliente,
    Fisica,
    Juridica,
    Endereco,
    Cidade,
    Estado,
    Funcionario,
    Consignacao,
    Compra,
    Troca,
    Gasto,
    Manutencao,
    Gerente,
    Vendedor,
    Comissao,
    PagamentoVenda
}