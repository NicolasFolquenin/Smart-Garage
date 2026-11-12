# 🚗 Smart Garage

> **Sistema Completo e Inteligente para Gestão de Garagens, Lojas de Veículos e Concessionárias.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)
![React](https://img.shields.io/badge/React-v19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-v7-646cff.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Executar o Projeto](#-como-executar-o-projeto)
  - [Opção 1: Com Docker Compose (Recomendado)](#1-com-docker-compose-ambiente-completo-recomendado)
  - [Opção 2: Desenvolvimento Local (Sem Docker)](#2-desenvolvimento-local-manual)
- [Variáveis de Ambiente (.env)](#-variáveis-de-ambiente-env)
- [Scripts Utilitários e Carga Inicial](#-scripts-utilitários-e-carga-inicial)
- [Atualização em Produção / Servidor](#-atualização-em-produção--servidor-vm)
- [Licença](#-licença)

---

## 📖 Visão Geral

O **Smart Garage** é uma plataforma moderna e robusta projetada para transformar e centralizar o fluxo operacional e financeiro de revendedoras de veículos. O sistema elimina planilhas descentralizadas, proporcionando rastreabilidade total de estoque, controle minucioso de comissões, gerenciamento de despesas operacionais e inteligência financeira com relatórios de lucratividade real por veículo vendido.

---

## ✨ Funcionalidades Principais

### 🚘 Gestão de Veículos e Estoque
- **Multi-Origem de Entrada:** Suporte a veículos oriundos de **Compra**, **Troca**, **Consignação** e **Estoque Inicial** (carros já presentes na loja na implantação do sistema).
- **Custo Real de Aquisição:** Rastreamento do valor pago na compra ou valor atribuído no estoque inicial para cálculo preciso da margem de lucro.
- **Galeria de Fotos:** Upload e gerenciamento de imagens dos veículos com redimensionamento e exibição responsiva.
- **Categorização:** Cadastro de marcas, modelos, anos de fabricação/modelo, placas, renavam, cor e tipo de combustível.

### 💰 Vendas e Financeiro
- **Múltiplas Formas de Pagamento:** Venda de veículos parcelada ou dividida em múltiplos métodos (Dinheiro, PIX, Financiamento, Cartão de Crédito e Veículo na Troca).
- **Cálculo Automático de Lucro Líquido:** Diferença entre o valor de venda, o custo de aquisição e a comissão do vendedor.
- **Trocas Complexas:** Controle da entrada de um seminovo na negociação com apuração de torna/diferença a receber ou a pagar.
- **Consignações:** Gestão de veículos de terceiros à venda na loja com status e comissões acordadas.

### 📊 Relatórios Gerenciais & BI
- **Balanço Geral:** Apuração consolidada entre Receitas Operacionais (Lucro das Vendas) versus Despesas Operacionais (Gastos Gerais + Manutenções mecânicas/estéticas), gerando o Saldo Líquido do período.
- **Relatórios Específicos:** Filtragem avançada por data para Vendas, Compras, Trocas, Consignações, Gastos e Manutenções.
- **Exportação em PDF Profissional:** Geração instantânea de relatórios formais para impressão ou auditoria, incluindo cabeçalho configurável com o nome da loja, sumário de indicadores, tabelas zebradas e gráficos.

### 👥 Clientes, Equipe e Segurança
- **Pessoa Física e Jurídica:** Gestão completa de clientes com validação de CPF/CNPJ, múltiplos endereços, contatos e histórico de compras.
- **Vendedores e Gerentes:** Níveis de acesso diferenciados, controle de comissões por venda e acompanhamento de metas.
- **Autenticação Segura:** Autenticação via JSON Web Tokens (JWT), senhas criptografadas com `bcrypt` e fluxo seguro de redefinição de senha com envio de e-mail via SMTP.

---

## 🛠 Arquitetura e Tecnologias

A aplicação é dividida em dois ecossistemas desacoplados prontos para conteinerização:

### Backend (`smart-garage-api`)
- **Runtime:** [Node.js](https://nodejs.org/) (Express 5)
- **Banco de Dados:** [MySQL 8.0](https://www.mysql.com/)
- **ORM:** [Sequelize](https://sequelize.org/) com migrações automáticas de esquema no boot
- **Autenticação & Segurança:** JWT (`jsonwebtoken`), hash de senha com `bcryptjs`, proteção contra força bruta com `express-rate-limit`
- **Uploads & Mídia:** `multer`
- **E-mails Transacionais:** `nodemailer`

### Frontend (`smart-garage-ui`)
- **Framework:** [React 19](https://react.dev/) via [Vite](https://vitejs.dev/)
- **Estilização & UI:** React Bootstrap, Bootstrap 5, Bootstrap Icons
- **Gráficos & Dashboards:** [Chart.js](https://www.chartjs.org/) & `react-chartjs-2`
- **Exportação de Documentos:** `jspdf`, `jspdf-autotable` e `html2canvas`
- **Roteamento & Requisições:** React Router DOM v7 e Axios

---

## 📁 Estrutura do Repositório

```text
smart-garage/
├── docker-compose.yml              # Orquestrador central dos containers (DB, API, UI)
├── PLANO_SAAS.md                   # Planejamento estratégico e evolução arquitetural
│
├── smart-garage-api/               # Backend RESTful (Node.js + Express)
│   ├── config/                     # Configuração Sequelize e banco
│   ├── controllers/                # Regras de negócio da aplicação
│   ├── middleware/                 # Autenticação JWT, CORS e validações
│   ├── models/                     # Entidades e relacionamentos do banco de dados
│   ├── routes/                     # Endpoints da API REST
│   ├── uploads/                    # Armazenamento persistente de fotos de veículos
│   ├── Dockerfile                  # Dockerfile do Backend
│   ├── index.js                    # Ponto de entrada do servidor e migrações automáticas
│   ├── criar-gerente.js            # Script para criação do usuário administrador inicial
│   └── popular-banco.js            # Carga de marcas e modelos iniciais
│
└── smart-garage-ui/                # Frontend SPA (React + Vite)
    ├── src/
    │   ├── components/             # Telas de cadastro, edição, listagem e consultas
    │   ├── context/                # Contexto global de autenticação e sessão
    │   ├── services/               # Camada de comunicação HTTP (Axios)
    │   └── utils/                  # Gerador de PDF, formatadores e validadores
    ├── nginx.conf                  # Servidor web de alta performance para a SPA
    ├── Dockerfile                  # Build multi-stage para produção (Node -> Nginx)
    └── vite.config.js              # Configuração do bundler Vite
```

---

## 🚀 Como Executar o Projeto

### 1. Com Docker Compose (Ambiente Completo - Recomendado)

O Docker Compose sobe automaticamente o banco de dados MySQL, o servidor da API com auto-migração e a interface web configurada com Nginx.

#### Passo 1: Clone o Repositório
```bash
git clone https://github.com/NicolasFolquenin/Smart-Garage.git
cd Smart-Garage
```

#### Passo 2: Configure as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (ou configure as variáveis no ambiente da sua máquina/servidor):
```env
# Banco de Dados
DB_USER=root
DB_PASS=suaSenhaSeguraAqui
DB_NAME=smart_garage

# Segurança da API
JWT_SECRET=gereUmaChaveMestraLongaEAleatoriaAqui123!@#

# Configurações do Frontend (Passadas no build)
VITE_API_URL=http://localhost:3000
VITE_NOME_EMPRESA="Nome da Sua Loja de Veículos"
```

#### Passo 3: Inicialize os Containers
```bash
docker compose up -d --build
```

#### Passo 4: Crie o Usuário Administrador Inicial
Com os containers ativos, execute o script de criação do gerente:
```bash
docker compose exec api node criar-gerente.js
```

Pronto! Os serviços estarão disponíveis em:
- **Painel Web (Frontend):** [http://localhost:5173](http://localhost:5173)
- **API REST (Backend):** [http://localhost:3000](http://localhost:3000)
- **Banco de Dados (MySQL):** `localhost:3306`

---

### 2. Desenvolvimento Local (Manual)

Caso prefira rodar os serviços individualmente fora do Docker:

#### 1. Banco de Dados MySQL
Certifique-se de possuir um servidor MySQL rodando localmente na porta 3306 e crie a base de dados:
```sql
CREATE DATABASE smart_garage CHARACTER SET utf8 COLLATE utf8_general_ci;
```

#### 2. Backend (API)
```bash
cd smart-garage-api
npm install
cp .env.example .env   # Ajuste as credenciais no .env
node criar-gerente.js  # Cria os usuários iniciais
node index.js          # Inicia na porta 3000
```

#### 3. Frontend (UI)
```bash
cd ../smart-garage-ui
npm install
cp .env.example .env   # Ajuste o VITE_API_URL se necessário
npm run dev            # Inicia o servidor Vite (http://localhost:5173)
```

---

## 🔑 Variáveis de Ambiente (.env)

### Backend (`smart-garage-api/.env`)
| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `PORT` | Porta onde o servidor Node roda | `3000` |
| `NODE_ENV` | Modo de execução | `production` ou `development` |
| `DB_HOST` | Host do MySQL (no Docker use `db`) | `db` ou `localhost` |
| `DB_PORT` | Porta do banco de dados | `3306` |
| `DB_NAME` | Nome do banco de dados | `smart_garage` |
| `DB_USER` | Usuário do MySQL | `root` |
| `DB_PASS` | Senha do MySQL | `senha_forte` |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT | `chave_criptografica_longa` |
| `FRONTEND_URL` | Origem permitida nas requisições CORS | `https://minhaloja.com.br` |
| `EMAIL_HOST` | Servidor SMTP para recuperação de senha | `smtp.gmail.com` |
| `EMAIL_PORT` | Porta do servidor SMTP | `587` |
| `EMAIL_USER` | E-mail remetente | `suporte@garagem.com` |
| `EMAIL_PASS` | Senha de aplicativo do e-mail | `senha_app_16_digitos` |

### Frontend (`smart-garage-ui/.env`)
| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base da API consumida pelo cliente | `http://localhost:3000` |
| `VITE_NOME_EMPRESA` | Nome da loja exibido no cabeçalho do PDF | `Rodrigo Veículos` |

---

## ⚙️ Scripts Utilitários e Carga Inicial

A pasta `smart-garage-api/` possui scripts auxiliares prontos para uso:

- **`node criar-gerente.js`**: Cria o primeiro usuário gerente/administrador com permissão total para o primeiro login.
- **`node popular-banco.js`**: Insere previamente dezenas de marcas e modelos de carros no banco para agilizar os cadastros.
- **`node ajustar-estoque-inicial.js`**: Atualiza veículos antigos cadastrados antes da funcionalidade de Estoque Inicial, garantindo consistência financeira.

> 💡 **Nota sobre Migrações:** Toda vez que a API inicia, ela executa verificações automáticas de esquema no MySQL para garantir a existência de novos campos (como `custo_aquisicao`) e novos valores em enums (`Estoque Inicial`), tornando os deploys livres de comandos SQL manuais.

---

## 🔄 Atualização em Produção / Servidor (VM)

Para atualizar a aplicação em sua máquina virtual ou servidor VPS sem risco de perda de dados:

```bash
# 1. Acesse o diretório do projeto no servidor
cd /opt/servicos/expressao-sgapp

# 2. Puxe as últimas atualizações do repositório
git pull origin main

# 3. Reconstrua e suba os containers atualizados
docker compose up -d --build
```

> 🛡️ **Segurança de Dados:** O banco de dados MySQL está alocado no volume nomeado `mysql_data` e as imagens de carros no volume `./smart-garage-api/uploads`. Esses dados **permanecem intactos** durante todo o processo de rebuild e restart dos containers.

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE). Sinta-se livre para utilizar, modificar e distribuir conforme suas necessidades.

---

Desenvolvido com foco em eficiência, segurança e inteligência de negócios para o mercado automotivo. 🏁
