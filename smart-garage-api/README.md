# Smart Garage - API Backend

Esta é a API RESTful para o sistema de gerenciamento de concessionárias de veículos Smart Garage. Ela é responsável por toda a lógica de negócio, interações com o banco de dados e segurança da aplicação.

---

## ⚙ Tecnologias Utilizadas

* **Plataforma:** Node.js
* **Framework:** Express.js
* **Banco de Dados:** MySQL
* **ORM (Object-Relational Mapping):** Sequelize (com `sequelize-cli` para Migrations e Seeds)
* **Autenticação:** JWT (JSON Web Tokens) com a biblioteca `jsonwebtoken`
* **Criptografia de Senhas:** `bcryptjs`
* **Upload de Arquivos:** `multer`
* **Envio de E-mails:** `Nodemailer`
* **Variáveis de Ambiente:** `dotenv`
* **CORS:** `cors`

---

## 📁 Estrutura de Pastas

A estrutura do projeto foi organizada para separar as responsabilidades, facilitando a manutenção e escalabilidade.

```
/smart-garage-api
|
├─── config/          # Configurações do banco de dados para o Sequelize
├─── controllers/     # Contém a lógica de negócio
├─── middleware/      # Funções que rodam entre a requisição e o controller
├─── models/          # Definições dos modelos do Sequelize (tabelas do banco)
├─── routes/          # Definição dos endpoints da API
├─── seeders/         # Arquivos para popular o banco de dados com dados iniciais
├─── services/        # Serviços auxiliares
├─── uploads/         # Pasta onde as imagens dos veículos são salvas
├─── .env             # Variáveis de ambiente e segredos
└─── index.js         # Ponto de entrada principal do servidor
```

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para configurar e rodar o ambiente de desenvolvimento local.

**1. Pré-requisitos:**
* Node.js (versão 16 ou superior)
* Um servidor de banco de dados MySQL rodando localmente.

**2. Clonar o Repositório:**
```bash
git clone https://github.com/guilhermebastosalves/smart-garage-api
cd smart-garage-api
```

**3. Instalar as Dependências:**
```bash
npm install
```

**4. Configurar o Banco de Dados:**
* Crie um banco de dados no seu MySQL com o nome `smart_garage`.
* Configure as credenciais de acesso no arquivo `config/config.json`.

**5. Configurar as Variáveis de Ambiente:**
* Crie um arquivo chamado `.env` na raiz do projeto.
* Copie e cole o conteúdo abaixo, substituindo os valores pelos seus.

```env
# .env.example
# Segredo para gerar os tokens JWT (use uma string longa e aleatória)
JWT_SECRET=use_uma_string_longa_de_sua_escolha_aqui

# Configurações do seu serviço de e-mail (exemplo para o Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua_senha_de_aplicativo_de_16_digitos
```

**6. Rodar as Seeds:**
* Execute os seguintes comandos no terminal para criar as tabelas e popular o banco de dados com dados iniciais.

```bash
# Popula as tabelas com dados iniciais (marcas e modelos)
npx sequelize-cli db:seed:all
```

**7. Iniciar o Servidor:**
* Para iniciar o servidor em modo de desenvolvimento (reinicia automaticamente ao salvar):

```bash
node --watch index.js
```
* A API estará rodando em `http://localhost:3000` (ou na porta definida no seu `.env` ou `index.js`).
