# ProntoVital — Plataforma Digital Integrada de Saúde e Agendamentos Inteligentes

<p align="center">
  <img src="https://img.shields.io/badge/Status-Ativo-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind-blue?style=for-the-badge" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20Sequelize-green?style=for-the-badge" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-informational?style=for-the-badge" alt="Database" />
</p>

---

## 📑 Sumário Executivo

1. [Visão Geral e Contexto de Negócio](#-visão-geral-e-contexto-de-negócio)
2. [O Problema e a Proposta de Valor](#-o-problema-e-a-proposta-de-valor)
3. [Pilares de Engenharia e Design](#-pilares-de-engenharia-e-design)
4. [Módulos e Perfis de Acesso (RBAC)](#-módulos-e-perfis-de-acesso-rbac)
   - [4.1 Administrador Global](#41-administrador-global-admin)
   - [4.2 Clínicas Parceiras](#42-clínicas-parceiras-clinica)
   - [4.3 Profissionais de Saúde](#43-profissionais-de-saúde-profissional)
   - [4.4 Pacientes](#44-pacientes-paciente)
5. [Arquitetura Tecnológica](#-arquitetura-tecnológica)
6. [Estrutura de Diretórios (Frontend)](#-estrutura-de-diretórios-frontend)
7. [Instalação e Execução Local](#-instalação-e-execução-local)
8. [Configuração de Ambiente](#-configuração-de-ambiente)
9. [Segurança e Autenticação](#-segurança-e-autenticação)
10. [Scripts do Projeto](#-scripts-do-projeto)
11. [Contribuidores e Autoria](#-contribuidores-e-autoria)

---

## 🏥 Visão Geral e Contexto de Negócio

O **ProntoVital** é uma solução digital corporativa concebida para transformar a forma como pacientes, unidades de saúde e médicos se conectam. Projetado prioritariamente no contexto do **Polo Médico de Recife (PE)** — considerado o segundo maior polo de saúde do Brasil e referência em procedimentos complexos no Nordeste —, o sistema atua como uma ponte estratégica entre a demanda do cidadão e a capacidade de atendimento da rede parceira.

A plataforma combina **UX intuitiva**, **arquitetura de microsserviços/APIs RESTful**, **banco de dados relacional** e **capacidades de triagem orientada**, fornecendo um ecossistema seguro e escalável tanto para navegadores desktop quanto para dispositivos móveis (PWA).

---

## 🎯 O Problema e a Proposta de Valor

### O Cenário Atual (Dores do Setor)
* **Jornada Fragmentada do Paciente:** O paciente muitas vezes não sabe qual especialidade médica procurar para os seus sintomas, enfrentando ligações demoradas, falta de visibilidade sobre horários vagos e deslocamentos desnecessários.
* **Sobrecarga e Ociosidade Clínica:** Clínicas e consultórios sofrem com faltas não notificadas (*no-show*), dificuldade para organizar escalas de médicos e falta de ferramentas centralizadas para gerenciar turnos.
* **Falta de Gestão Unificada:** Gestores de redes de saúde carecem de uma visão unificada para credenciar novas unidades, alocar profissionais e auditar agendamentos.

### A Solução ProntoVital (Entregas de Valor)
* **Orientação e Pré-Triagem:** Interface amigável para levantamento de queixas e sintomas, direcionando o paciente à especialidade correta.
* **Agendamento Inteligente em Tempo Real:** Consulta dinâmica à disponibilidade de agenda dos profissionais por data e turno, eliminando conflitos de horário.
* **Gestão Multiclínica:** Painéis administrativos independentes que permitem o gerenciamento de múltiplas unidades médicas e convênios na mesma base.
* **Integração em Nuvem:** Sincronização centralizada com persistência em banco relacional seguro.

---

## 🛡️ Pilares de Engenharia e Design

* **Acessibilidade & Usabilidade (UX/UI):** Design system consistente baseado no Figma, tipografia clara (Inter), alto contraste, navegação ágil e responsividade completa para celulares, tablets e desktops.
* **Segurança e Proteção de Dados:** Autenticação stateless via **JSON Web Tokens (JWT)**, armazenamento criptografado de credenciais via **Bcrypt** e validação de autorização por middleware em todas as rotas restritas.
* **Arquitetura Baseada em Recursos (Feature-Driven):** Código desacoplado por domínio de negócio (`admin`, `clinica`, `profissional`, `paciente`), facilitando manutenção, testes e evolução independente de telas.
* **Integração Real com API:** Todas as operações administrativas e clínicas consomem endpoints HTTP autenticados, com zero persistência fictícia ou dados mockados.

---

## 👥 Módulos e Perfis de Acesso (RBAC)

O ProntoVital implementa um rigoroso controle de acesso baseado em papéis (*Role-Based Access Control*):

```
                        ┌──────────────────────────────┐
                        │      Autenticação JWT        │
                        │      (/auth/login)           │
                        └──────────────┬───────────────┘
                                       │
        ┌──────────────────┬───────────┴───────────┬──────────────────┐
        │                  │                       │                  │
        ▼                  ▼                       ▼                  ▼
┌──────────────┐   ┌──────────────┐        ┌──────────────┐   ┌──────────────┐
│ Administrador│   │   Clínica    │        │ Profissional │   │   Paciente   │
│   (admin)    │   │  (clinica)   │        │(profissional)│   │  (paciente)  │
└──────────────┘   └──────────────┘        └──────────────┘   └──────────────┘
```

### 4.1 Administrador Global (`admin`)
Perfil estratégico com permissões totais para orquestrar a rede:
* **Gestão de Clínicas:** Cadastro de unidades de saúde parceiras via `POST /usuarios` com definição de credenciais de acesso, CNPJ, endereço completo, telefone e bairro.
* **Gestão de Profissionais:** Credenciamento de novos médicos (CRM, estado emissor, CPF) e vinculação oficial a uma ou mais clínicas conveniadas via `PATCH /clinicas/:id/profissionais/:id`.
* **Central de Agendamentos:** Visualização de todas as consultas da rede de saúde, cancelamento assistido e criação de consultas (selecionando paciente, médico, unidade e horário vago em tempo real).

### 4.2 Clínicas Parceiras (`clinica`)
Painel operacional para administração da unidade de saúde:
* **Visão Geral (Dashboard):** Indicadores em tempo real (consultas do dia, atendimentos pendentes, cancelamentos e total de médicos vinculados).
* **Agenda da Unidade:** Grade de consultas organizadas por dia e profissional.
* **Agendamentos:** Tabela de atendimentos com filtros por status e ação de cancelamento.
* **Corpo Clínico:** Relação de todos os médicos vinculados à clínica.
* **Disponibilidade e Escalas:** Definição dos turnos de funcionamento e horários de atendimento dos médicos por dia da semana (`POST /profissionais/:id/horarios`).
* **Perfil Institucional:** Visualização cadastral dos dados da clínica.

### 4.3 Profissionais de Saúde (`profissional`)
Ambiente de trabalho focado no atendimento médico:
* **Agenda Médica:** Acompanhamento dinâmico das consultas confirmadas e canceladas.
* **Gestão de Consultas:** Acesso rápido à listagem de atendimentos da jornada.

### 4.4 Pacientes (`paciente`)
Área voltada ao usuário final do sistema de saúde:
* **Fluxo de Pré-Triagem:** Formulário interativo para registro de queixas e histórico preliminar.
* **Agendamento de Consultas:** Busca de médicos e clínicas parceiras por especialidade e confirmação de horários.
* **Meus Agendamentos:** Consulta e cancelamento de consultas marcadas.
* **Perfil do Paciente:** Edição de dados cadastrais, telefone, endereço e observações de saúde (alergias e restrições).

---

## 💻 Arquitetura Tecnológica

### Frontend (`prontovital-web`)
* **React 19:** Biblioteca base com hooks modernos (`useState`, `useEffect`, `useCallback`, `useContext`).
* **Vite 8:** Ambiente de compilação ultrarrápido com Hot Module Replacement (HMR).
* **React Router DOM 7:** Roteamento declarativo com layouts aninhados e rotas protegidas por token.
* **Tailwind CSS 4:** Estilização utilitária com design tokens, flexbox/grid e microinterações.
* **Axios:** Cliente HTTP com interceptors que injetam o cabeçalho `Authorization: Bearer <token>` em todas as requisições autenticadas e tratam expiração de sessão.

### Backend & Banco de Dados (`prontovital-api`)
* **Node.js & Express 5:** Servidor RESTful com arquitetura em camadas (Rotas, Controladores, Modelos, Middlewares).
* **Sequelize ORM:** Mapeamento objeto-relacional com relacionamentos `1:N` e `N:N` (`User`, `Clinica`, `Profissional`, `Paciente`, `Agendamento`, `Horario`, `ClinicaProfissional`).
* **PostgreSQL 16:** Banco de dados relacional com integridade referencial.
* **Swagger (OpenAPI 3.0):** Documentação interativa dos contratos de API.

---

## 📁 Estrutura de Diretórios (Frontend)

O frontend utiliza uma estrutura modular orientada a funcionalidades (**Feature-Driven Architecture**):

```text
prontovital-web/
├── public/                     # Assets estáticos públicos (ícones, logos)
├── src/
│   ├── app/                    # Bootstrap da aplicação
│   │   ├── App.jsx             # Componente raiz com Provedores de contexto
│   │   ├── main.jsx            # Ponto de entrada do React
│   │   └── routes.jsx          # Definição e proteção das rotas globais
│   ├── components/
│   │   └── shared/             # Componentes atômicos reutilizáveis (Button, Input, Badge, Modal, Spinner)
│   ├── features/               # Domínios de negócio isolados
│   │   ├── admin/              # Módulo do Administrador (Páginas, Layout e Rotas)
│   │   ├── clinica/            # Módulo da Clínica (Páginas, Layout e Rotas)
│   │   ├── profissional/       # Módulo do Médico (Páginas, Layout e Rotas)
│   │   ├── paciente/           # Módulo do Paciente (Páginas, Layout e Rotas)
│   │   └── auth/               # Telas de Autenticação (Login e Registro)
│   ├── lib/                    # Camada de serviços e integração HTTP
│   │   ├── api.js              # Instância configurada do Axios com interceptors
│   │   ├── authService.js      # Serviços de autenticação e sessão local
│   │   ├── clinicasApi.js      # Integração das rotas de clínicas
│   │   ├── profissionaisApi.js # Integração das rotas de profissionais
│   │   ├── agendamentosApi.js  # Integração das rotas de agendamentos
│   │   └── pacientesApi.js     # Integração das rotas de pacientes
│   ├── shared/                 # Recursos transversais
│   │   ├── context/            # Contexto global de autenticação (AuthContext)
│   │   ├── hooks/              # Custom hooks (useAuth, usePaciente)
│   │   └── utils/              # Funções utilitárias (formatação de datas, moedas e strings)
│   └── styles/                 # Estilos globais e diretivas do Tailwind
├── .env                        # Variáveis de ambiente locais (não comitado)
├── .env.example                # Modelo de configuração de ambiente
├── package.json                # Manifesto de dependências e scripts do npm
└── vite.config.js              # Configurações do compilador Vite
```

---

## ⚡ Instalação e Execução Local

### Pré-requisitos
* **Node.js** v18 ou superior instalado ([Download Node.js](https://nodejs.org))
* **npm** (incluso com o Node.js)
* **Git** instalado

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/MaveBunny/Prontovital.git
   cd Prontovital
   ```

2. **Entrar na pasta do Frontend:**
   ```bash
   cd prontovital-web
   ```

3. **Instalar as dependências do projeto:**
   ```bash
   npm install
   ```

4. **Configurar as variáveis de ambiente:**
   Copie o template `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   *(No Windows PowerShell: `Copy-Item .env.example .env`)*

5. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acessar a aplicação no navegador:**
   Abra: [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Configuração de Ambiente

As configurações de conexão são mantidas no arquivo `.env` (ignorado pelo versionamento para proteção de dados). Consulte o modelo em `.env.example`:

```env
# URL base da API do ProntoVital
VITE_API_URL=http://localhost:3000
```

> [!NOTE]
> Para conectar a instâncias de desenvolvimento compartilhadas ou homologação em nuvem, atualize o valor de `VITE_API_URL` com a URL do ambiente fornecida internamente pela equipe de infraestrutura.

---

## 🔒 Segurança e Autenticação

* **Controle de Acesso:** A comunicação entre o frontend e a API é protegida por **Tokens JWT** enviados via cabeçalho HTTP:
  ```http
  Authorization: Bearer <seu_token_jwt>
  ```
* **Criptografia de Senhas:** Senhas são processadas com algoritmo de hash unidirecional seguro (**Bcrypt**) com *salt* no momento do cadastro.
* **Proteção de Credenciais:** Contas de acesso e chaves de segurança são de uso restrito e devem ser geradas através dos fluxos de cadastro da aplicação ou solicitadas à equipe administrativa do projeto.

---

## 📜 Scripts do Projeto

Executados a partir da pasta `prontovital-web`:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicializa o servidor de desenvolvimento com recarregamento em tempo real (HMR). |
| `npm run build` | Compila os arquivos para produção na pasta `dist/` com verificação de sintaxe e minificação. |
| `npm run preview` | Roda um servidor HTTP local simulando o comportamento exato da versão de produção. |

---

## 👥 Contribuidores e Autoria

Projeto desenvolvido para a solução digital integrada de saúde **ProntoVital**.

* **Repositório Oficial:** [github.com/MaveBunny/Prontovital](https://github.com/MaveBunny/Prontovital)
