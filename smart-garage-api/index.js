const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();

// O objeto db já contém todos os modelos carregados pelo /models/index.js
const db = require('./models/index');

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// IMPORTAÇÃO DE TODAS AS ROTAS
const automovelRoutes = require("./routes/automovelRoutes");
const cidadeRoutes = require("./routes/cidadeRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const comissaoRoutes = require("./routes/comissaoRoutes");
const compraRoutes = require("./routes/compraRoutes");
const consignacaoRoutes = require("./routes/consignacaoRoutes");
const enderecoRoutes = require("./routes/enderecoRoutes");
const estadoRoutes = require("./routes/estadoRoutes");
const fisicaRoutes = require("./routes/fisicaRoutes");
const funcionarioRoutes = require("./routes/funcionarioRoutes");
const gastoRoutes = require("./routes/gastoRoutes");
const juridicaRoutes = require("./routes/juridicaRoutes");
const loginRoutes = require("./routes/loginRoutes");
const manutencaoRoutes = require("./routes/manutencaoRoutes");
const marcaRoutes = require("./routes/marcaRoutes");
const modeloRoutes = require("./routes/modeloRoutes");
const relatorioRoutes = require("./routes/relatorioRoutes");
const trocaRoutes = require("./routes/trocaRoutes");
const vendaRoutes = require("./routes/vendaRoutes");
const vendedorRoutes = require("./routes/vendedorRoutes");

// CONFIGURAÇÃO DAS ROTAS
app.use('/api/automovel', automovelRoutes);
app.use('/api/cidade', cidadeRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/comissao', comissaoRoutes);
app.use('/api/compra', compraRoutes);
app.use('/api/consignacao', consignacaoRoutes);
app.use('/api/endereco', enderecoRoutes);
app.use('/api/estado', estadoRoutes);
app.use('/api/fisica', fisicaRoutes);
app.use('/api/funcionario', funcionarioRoutes);
app.use('/api/gasto', gastoRoutes);
app.use('/api/juridica', juridicaRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/manutencao', manutencaoRoutes);
app.use('/api/marca', marcaRoutes);
app.use('/api/modelo', modeloRoutes);
app.use('/api/relatorio', relatorioRoutes);
app.use('/api/troca', trocaRoutes);
app.use('/api/venda', vendaRoutes);
app.use('/api/vendedor', vendedorRoutes);

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// SERVIDOR E BANCO DE DADOS
db.sequelize.sync({ force: false }).then(() => {
    console.log("Banco de dados sincronizado!");
    
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Erro ao sincronizar banco de dados:", err);
});