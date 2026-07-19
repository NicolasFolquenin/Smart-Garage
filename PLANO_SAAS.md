# Arquitetura Multi-Tenant para o Smart Garage

O objetivo deste plano é transformar o sistema atual (Single-Tenant) em uma arquitetura **Multi-Tenant** (Multilocatário). Com isso, você poderá vender o sistema como um serviço (SaaS), onde múltiplas lojas/garagens utilizam a mesma aplicação e o mesmo banco de dados, mas cada uma enxerga apenas os seus próprios dados, de forma totalmente isolada e segura.

## User Review Required

> [!WARNING]
> **Impacto no Banco de Dados**
> A transição para Multi-Tenant exige alterações em **todas** as tabelas principais do banco de dados (inserção de um identificador de loja). Se houver dados em produção, será necessário criar um script de migração para atribuir os registros existentes a uma "Loja Padrão" (a sua garagem atual) antes de aplicar as restrições.

## Decisões de Arquitetura Definidas

1. **Modelos e Marcas:** Serão globais. Todas as lojas compartilharão o mesmo catálogo base de automóveis, o que evita duplicidade e facilita a busca (ex: um "Chevrolet Onix" criado pela Loja A poderá ser usado pela Loja B).
2. **Separação de Acesso (Recomendação):** Iniciaremos com a **Identificação via Login** (Domínio Único). Todas as lojas acessam o mesmo link (ex: `app.smartgarage.com`). O sistema descobre de qual loja o usuário é a partir do e-mail de login. Isso é muito mais fácil de manter no início do que configurar dezenas de subdomínios e certificados SSL. No futuro, podemos evoluir para subdomínios (ex: `loja1.smartgarage.com`).
3. **Painel Super Admin:** Será criada uma tela exclusiva para o Super Admin gerenciar todas as lojas cadastradas, com um botão (switch) para ativar ou inativar o acesso de toda a loja de uma só vez (bloqueando instantaneamente o acesso de todos os funcionários daquela loja).

---

## Proposed Changes

### 1. Banco de Dados e Modelagem

- Criar a entidade **Loja** (ou Tenant):
  - Campos: `id`, `nome_fantasia`, `cnpj`, `logo`, `ativo`, `data_cadastro`.
- Atualizar todas as entidades dependentes para incluir a chave estrangeira `lojaId`:
  - `Automovel`, `Cliente`, `Venda`, `Compra`, `Troca`, `Consignacao`, `Gasto`, `Manutencao`, `Funcionario`, `Comissao`.

### 2. Autenticação e Segurança (Backend)

- **JWT Token Atualizado:** 
  - Quando um funcionário fizer login, o token gerado deverá conter o `lojaId` ao qual ele pertence.
- **Middleware de Isolamento (Row-Level Security no Express):**
  - Criar um middleware que intercepta todas as requisições autenticadas e injeta o `lojaId` (obtido do Token) na requisição (ex: `req.user.lojaId`).
- **Controladores (Controllers):**
  - Modificar **TODAS** as consultas (GET, POST, PUT, DELETE) para usar o `lojaId`.
  - Exemplo de como ficará o código de listagem de estoque:
    ```javascript
    Entidade.Automovel.findAll({ where: { lojaId: req.user.lojaId } })
    ```
  - Isso garante que a Loja A **nunca** veja os carros da Loja B, mesmo que tentem acessar a API diretamente.

### 3. Painel Super Admin

- Criar um nível de acesso acima do "Gerente": o **Super Admin** (Você).
- O Super Admin terá uma interface exclusiva para:
  - Cadastrar novas Lojas (Tenants).
  - Bloquear ou excluir Lojas.
  - Cadastrar o primeiro "Gerente" de cada nova loja.

### 4. Interface do Usuário (Frontend)

- **Login:** Nenhuma mudança na interface, mas o sistema identificará a loja pelo e-mail do usuário logado.
- **Header Dinâmico:** A logo exibida no `Header.jsx` pode ser dinâmica, buscando a imagem da tabela `Loja`, permitindo que cada cliente veja a sua própria logomarca.
- **Rotas:** Os gerentes comuns não terão acesso às rotas do Super Admin.

---

## Verification Plan

### Automated Tests
- Testar endpoints simulando tokens de lojas diferentes para garantir que dados da Loja A não vazam para a Loja B.

### Manual Verification
- Cadastrar duas lojas de teste no banco de dados.
- Fazer login com a Loja 1, cadastrar um veículo e cliente.
- Fazer logout e entrar com a conta da Loja 2: a tela de estoque deverá aparecer completamente vazia.
