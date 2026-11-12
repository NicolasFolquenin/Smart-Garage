# 🚗 Smart Garage

> **Sistema Completo e Inteligente para Gestão de Garagens, Lojas de Veículos e Concessionárias.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)
![React](https://img.shields.io/badge/React-v19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-v7-646cff.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)
![Security](https://img.shields.io/badge/Security-RBAC%20%7C%20Audit-red.svg)
![Cloud Backup](https://img.shields.io/badge/Backup-Google%20Drive-yellow.svg)

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Executar o Projeto](#-como-executar-o-projeto)
  - [Opção 1: Com Docker Compose (Recomendado para Produção e Staging)](#1-com-docker-compose-ambiente-completo-recomendado)
  - [Opção 2: Desenvolvimento Local (Manual)](#2-desenvolvimento-local-manual)
- [Sistema de Backup e Nuvem (Google Drive)](#-sistema-de-backup-e-nuvem-google-drive)
- [Segurança e Perfis de Acesso (RBAC)](#-segurança-e-perfis-de-acesso-rbac)
- [Variáveis de Ambiente (.env)](#-variáveis-de-ambiente-env)
- [Scripts Utilitários e Carga Inicial](#-scripts-utilitários-e-carga-inicial)
- [Atualização em Produção / Servidor (VM)](#-atualização-em-produção--servidor-vm)
- [Licença](#-licença)

---

## 📖 Visão Geral

O **Smart Garage** é uma plataforma moderna e completa desenvolvida para transformar a gestão operacional, financeira e comercial de revendedoras de veículos. Ele substitui controles manuais e planilhas desorganizadas por um ecossistema unificado, oferecendo rastreabilidade de estoque com custo de aquisição, apuração real de lucro por venda, rateio de comissões, controle de manutenções, rotinas de auditoria, backups automáticos na nuvem e relatórios gerenciais profissionais em PDF.

---

## ✨ Funcionalidades Principais

### 🚘 Gestão de Veículos e Estoque
- **Multi-Origem de Entrada:** Suporte a veículos oriundos de **Compra**, **Troca**, **Consignação** e **Estoque Inicial** (carros que já estavam na garagem antes da implantação do sistema).
- **Custo Real de Aquisição:** Rastreamento do valor pago na compra ou valor atribuído no estoque inicial para apuração precisa da margem de lucro por unidade.
- **Galeria de Fotos:** Upload com validação de segurança (MIME types permitidos, sanitização de nomes e limite de tamanho), com redimensionamento e exibição responsiva.
- **Ficha Técnica Completa:** Marca, modelo, ano de fabricação/modelo, placa com máscara, Renavam, cor, quilometragem e combustível.

### 💰 Vendas e Financeiro
- **Múltiplas Formas de Pagamento:** Venda de veículos parcelada ou dividida em múltiplos métodos (Dinheiro, PIX, Financiamento Bancário, Cartão de Crédito e Veículo Usado na Troca).
- **Cálculo Automático de Lucro Líquido:** Subtração direta entre o valor de venda, o custo de aquisição do veículo e a comissão do vendedor.
- **Trocas Complexas:** Controle da entrada de um seminovo na negociação com apuração automática de torna/diferença a receber ou a pagar.
- **Consignações:** Gestão de veículos de terceiros expostos na loja com acompanhamento de vigência, status e comissões acordadas.

### 📊 Relatórios Gerenciais & Balanço Geral
- **Balanço Geral Integrado:** Apuração consolidada entre Receitas Operacionais (Lucro das Vendas) versus Despesas Operacionais (Gastos Gerais + Manutenções mecânicas/estéticas), gerando o Saldo Líquido do período.
- **Relatórios Específicos:** Filtragem avançada por período para Vendas, Compras, Trocas, Consignações, Gastos e Manutenções.
- **Exportação em PDF Profissional:** Geração instantânea de relatórios executivos para impressão ou arquivamento, incluindo cabeçalho configurável com o nome da loja, cards de indicadores coloridos (Verde/Vermelho), tabelas zebradas e gráficos.

### 🔒 Segurança, Auditoria e RBAC
- **Níveis de Acesso Granulares:** Papéis bem definidos para **Vendedor**, **Gerente** e **Super Administrador** (`super_admin`).
- **Blindagem de Rotas & Queries:** Omissão estrita de senhas nos retornos de API e validação de tokens JWT com expiração.
- **Recuperação de Senha por E-mail:** Fluxo seguro via SMTP com tokens temporários e expiração automática.

### ☁️ Backup & Disaster Recovery
- **Rotinas de Backup Automáticas:** Agendamento periódico de dumps do banco de dados e arquivos de mídia.
- **Integração com Google Drive:** Upload direto para pastas do Google Drive corporativo utilizando Service Account.
- **Restauração e Download:** Interface visual dedicada para criar backups manuais sob demanda, efetuar download de dumps `.sql` e restaurar o estado do banco com segurança.

---

## 🛠 Arquitetura e Tecnologias

A aplicação é dividida em dois ecossistemas desacoplados prontos para conteinerização:

### Backend (`smart-garage-api`)
- **Runtime:** [Node.js](https://nodejs.org/) (Express 5)
- **Banco de Dados:** [MySQL 8.0](https://www.mysql.com/)
- **ORM:** [Sequelize](https://sequelize.org/) com migrações automáticas de esquema no boot
- **Autenticação & Criptografia:** JWT (`jsonwebtoken`), `bcryptjs`
- **Segurança de Rede:** `express-rate-limit`, `cors`
- **Uploads & Mídia:** `multer` com filtros por magic bytes/extensão
- **E-mails Transacionais:** `nodemailer`
- **Cloud Storage:** Google Drive API v3 (Google APIs)

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
│   ├── config/                     # Configuração Sequelize, multer e banco
│   ├── controllers/                # Regras de negócio e handlers da API
│   ├── middleware/                 # Autenticação JWT, RBAC e validação de requisições
│   ├── models/                     # Entidades e relacionamentos do banco de dados
│   ├── routes/                     # Endpoints da API REST
│   ├── services/                   # Serviços de backup, Google Drive e envio de e-mails
│   ├── uploads/                    # Armazenamento local de fotos de veículos
│   ├── backups/                    # Armazenamento temporário de snapshots/dumps
│   ├── Dockerfile                  # Dockerfile do Backend
│   ├── index.js                    # Ponto de entrada do servidor e migrações automáticas
│   ├── criar-gerente.js            # Script para criação do usuário administrador inicial
│   └── popular-banco.js            # Carga de marcas e modelos iniciais
│
└── smart-garage-ui/                # Frontend SPA (React + Vite)
    ├── src/
    │   ├── components/             # Telas de cadastro, edição, listagem, relatórios e backups
    │   ├── context/                # Contexto global de autenticação e sessão
    │   ├── services/               # Camada de comunicação HTTP (Axios)
    │   └── utils/                  # Gerador de PDF, formatadores de moeda e validadores
    ├── nginx.conf                  # Servidor web Nginx para produção
    ├── Dockerfile                  # Build multi-stage para produção (Node -> Nginx)
    └── vite.config.js              # Configuração do bundler Vite
```

---

## 🚀 Como Executar o Projeto

### 1. Com Docker Compose (Ambiente Completo - Recomendado)

O Docker Compose sobe o banco de dados MySQL 8, o servidor da API com auto-migração e a interface web configurada com Nginx.

#### Passo 1: Clone o Repositório
```bash
git clone https://github.com/NicolasFolquenin/Smart-Garage.git
cd Smart-Garage
```

#### Passo 2: Configure as Variáveis de Ambiente
Crie o arquivo `smart-garage-api/.env` com base no exemplo:
```bash
cp smart-garage-api/.env.example smart-garage-api/.env
```
Edite as credenciais do banco e chaves secretas:
```env
DB_USER=root
DB_PASS=suaSenhaSeguraAqui
DB_NAME=smart_garage
JWT_SECRET=suaChaveSecretaMestreLongaEInviolavel
FRONTEND_URL=http://localhost:5173
```

#### Passo 3: Inicialize os Containers
```bash
docker compose up -d --build
```

#### Passo 4: Crie o Usuário Administrador Inicial
Com os containers ativos, execute o script de criação do gerente/admin:
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

## ☁️ Sistema de Backup e Nuvem (Google Drive)

O sistema conta com um módulo nativo de **Backups & Recuperação de Desastres**:

1. **Backups Locais:**
   - Dumps estruturados do MySQL (`mysqldump`) e arquivos de mídia.
   - Gerenciamento visual na rota `/backups` com data, tamanho do arquivo e status.

2. **Integração com Google Drive:**
   - Crie uma Conta de Serviço (Service Account) no [Google Cloud Console](https://console.cloud.google.com/).
   - Compartilhe uma pasta do Google Drive com o e-mail da Service Account (`client_email`).
   - Configure as variáveis no `smart-garage-api/.env`:
     ```env
     GOOGLE_DRIVE_FOLDER_ID=seu_folder_id_aqui
     GOOGLE_SERVICE_ACCOUNT_EMAIL=seu-sa@projeto.iam.gserviceaccount.com
     GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     BACKUP_AUTO_HOURS=24
     ```
   - O sistema sincronizará os snapshots na nuvem automaticamente a cada `BACKUP_AUTO_HOURS` horas.

---

## 🛡️ Segurança e Perfis de Acesso (RBAC)

O sistema implementa controle de acesso baseado em funções (Role-Based Access Control):

| Papel | Permissões |
| :--- | :--- |
| **Vendedor** | Cadastro e consulta de clientes, cadastro de veículos, registro de vendas e trocas. Acesso restrito a relatórios financeiros globais e configurações de sistema. |
| **Gerente** | Todas as ações de vendedor, aprovação de consignações, gerenciamento de comissões, lançamento de gastos operacionais e acesso aos relatórios gerenciais e balanço geral. |
| **Super Admin** | Acesso irrestrito a todos os módulos, gerenciamento de usuários funcionários, auditoria de senhas e gerenciamento de backups e restaurações. |

---

## 🔑 Variáveis de Ambiente (.env)

### Backend (`smart-garage-api/.env`)
| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `PORT` | Porta onde o servidor Node roda | `3000` |
| `NODE_ENV` | Modo de execução | `production` ou `development` |
| `DB_HOST` | Host do MySQL (no Docker utilize `db`) | `db` ou `localhost` |
| `DB_PORT` | Porta do banco de dados | `3306` |
| `DB_NAME` | Nome do banco de dados | `smart_garage` |
| `DB_USER` | Usuário do MySQL | `root` |
| `DB_PASS` | Senha do MySQL | `senha_segura` |
| `JWT_SECRET` | Chave secreta mestra para assinatura dos tokens JWT | `chave_criptografica_longa` |
| `FRONTEND_URL` | Origem autorizada no CORS | `https://minhaloja.com.br` |
| `EMAIL_HOST` | Servidor SMTP para recuperação de senha | `smtp.gmail.com` |
| `EMAIL_PORT` | Porta do servidor SMTP | `587` |
| `EMAIL_USER` | E-mail remetente | `suporte@garagem.com` |
| `EMAIL_PASS` | Senha de aplicativo do e-mail | `senha_app_16_digitos` |
| `GOOGLE_DRIVE_FOLDER_ID` | ID da pasta de destino no Google Drive | `1AbCdEfGhIjKlMnOp...` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`| E-mail da Service Account do Google | `sa@projeto.iam.gserviceaccount.com` |
| `GOOGLE_SERVICE_ACCOUNT_KEY`  | Chave privada RSA da Service Account | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `BACKUP_AUTO_HOURS` | Intervalo em horas para backups automáticos | `24` |

### Frontend (`smart-garage-ui/.env`)
| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base da API consumida pelo cliente | `http://localhost:3000` |
| `VITE_NOME_EMPRESA` | Nome da loja exibido no cabeçalho do PDF | `Rodrigo Veículos` |

---

## ⚙️ Scripts Utilitários e Carga Inicial

A pasta `smart-garage-api/` possui scripts auxiliares prontos para manutenção:

- **`node criar-gerente.js`**: Cria o primeiro usuário administrador com permissão total para o primeiro login.
- **`node popular-banco.js`**: Insere dezenas de marcas e modelos de carros no banco para agilizar os cadastros.
- **`node ajustar-estoque-inicial.js`**: Atualiza veículos cadastrados antes da funcionalidade de Estoque Inicial, garantindo consistência na apuração do lucro.

> 💡 **Nota sobre Migrações Automáticas:** A API executa verificações de esquema no MySQL no momento do boot para garantir que novas colunas (como `custo_aquisicao`) e novos valores em `ENUM` (`Estoque Inicial`) sejam criados sem requerer migrações manuais.

---

## 🔄 Atualização em Produção / Servidor (VM)

Para atualizar a aplicação em seu servidor ou máquina virtual Docker sem risco de indisponibilidade ou perda de dados:

```bash
# 1. Acesse o diretório do projeto no servidor
cd /opt/servicos/expressao-sgapp

# 2. Puxe as últimas atualizações do repositório
git pull origin main

# 3. Reconstrua e suba os containers atualizados
docker compose up -d --build
```

> 🛡️ **Segurança e Persistência:** Os dados do banco de dados MySQL estão alocados no volume nomeado `smart-garage-api_mysql_data` e os uploads em `./smart-garage-api/uploads`. Esses dados **permanecem 100% preservados** durante o processo de rebuild e restart dos containers.

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE). Sinta-se livre para utilizar, modificar e distribuir conforme suas necessidades.

---

Desenvolvido com foco em eficiência, segurança e inteligência de negócios para o mercado automotivo. 🏁
