# Smart Garage - Interface (UI)

Esta é a interface de usuário (UI) para o sistema de gerenciamento de concessionárias de veículos Smart Garage. Construída como uma Single Page Application (SPA) com React, ela consome os dados da [API Smart Garage](https://github.com/guilhermebastosalves/smart-garage-api) para fornecer uma experiência de usuário rica e interativa.

---

## ⚙ Tecnologias Utilizadas

* **Biblioteca Principal:** React.js
* **Framework de UI:** React Bootstrap & Bootstrap 5
* **Roteamento:** React Router
* **Cliente HTTP:** Axios
* **Gerenciamento de Estado Global:** React Context API (para autenticação)
* **Visualização de Dados (Gráficos):** Chart.js com `react-chartjs-2`
* **Ícones:** React Icons
* **Componentes Adicionais:**
    * `react-select` (para selects avançados)
    * `react-datepicker` (para seleção de datas)
    * `jwt-decode` (para decodificar tokens JWT no cliente)

---

## 📁 Estrutura de Pastas

A estrutura do projeto segue as convenções da comunidade React para uma organização clara.

```
/smart-garage-frontend
|
└─── src/
     |
     ├─── components/      # Componentes de página
     ├─── context/         # Provedores de Contexto
     ├─── services/        # Funções que se comunicam com a API
     ├─── App.jsx          # Componente principal com a configuração das rotas
     └─── main.jsx         # Ponto de entrada da aplicação React
```

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para configurar e rodar o ambiente de desenvolvimento local.

**1. Pré-requisitos:**
* Node.js (versão 16 ou superior)
* O **servidor da API Smart Garage** deve estar rodando.

**2. Clonar o Repositório:**
```bash
git clone https://github.com/guilhermebastosalves/smart-garage-ui
cd smart-garage-ui
```

**3. Instalar as Dependências:**
```bash
npm install
```

**4. Configurar a Conexão com a API:**
* Abra o arquivo `src/http-common.js`.
* Verifique se a `baseURL` corresponde ao endereço onde sua API está rodando.

**5. Iniciar o Servidor de Desenvolvimento:**
```bash
npm run dev
```

* A aplicação abrirá automaticamente no seu navegador.
