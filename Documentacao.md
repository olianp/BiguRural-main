# 🚗 Bigu Rural - Sistema de Caronas da UFRPE

## 👥 Equipe de Desenvolvimento

* **Gleiciane Priscila de Oliveira Andrade**
* **Natã Gabriel Cataldi dos Santos**
* **Daniel Heleno de Oliveira Santana Junior**
* **Mariene Silva da Cruz Santos**

## Descrição
O **Bigu Rural** é uma plataforma inteligente de caronas desenvolvida exclusivamente para a comunidade acadêmica da Universidade Federal Rural de Pernambuco (UFRPE). O sistema visa diminuir a emissão de CO2 na atmosfera e otimizar o deslocamento de alunos, centralizando a oferta e busca de caronas em um ambiente seguro e sustentável. Através dele, conectamos motoristas e passageiros que compartilham rotas semelhantes, promovendo a redução do uso de veículos individuais, a economia de custos e incentivando uma cultura colaborativa no campus.

## 🚀 Funcionalidades Implementadas
- **Autenticação Institucional:** Cadastro restrito a e-mails `@ufrpe.br` com verificação de conta segura através do envio de Token por e-mail.
- **Recuperação de Senha:** Fluxo seguro ponta a ponta com geração de token transiente (`reset_token`).
- **Gestão de Viagens:** Motoristas podem ofertar caronas, e passageiros podem realizar buscas precisas e reservar vagas instantaneamente.
- **Cadastro e Vínculo de Veículos:** Motoristas agora possuem seus veículos atrelados ao seu Perfil (`motorista_id`), automatizando a oferta de caronas.
- **Integração de Rotas:** Visualização de trajetos e mapas diretamente com o redirecionamento nativo para o Google Maps.
- **Sustentabilidade:** Cálculo automático de emissão de CO2 poupada em grupo, liberado após o motorista finalizar a viagem.
- **Histórico e Reputação:** Passageiros podem avaliar motoristas, gerando uma nota de confiabilidade para a comunidade.
- **Denúncias Dinâmicas Rastreáveis:** O sistema de denúncias cruza as tabelas de `reservas` e `caronas` para listar apenas motoristas com quem o passageiro viajou.
- **Painel de Administração (Admin):** Área restrita permitindo a moderação com ações de `Banimento Definitivo` ou `Arquivamento` de denúncias.
- **Notificações Inteligentes:** Cruzamento de dados do banco para notificar motoristas sobre solicitações e passageiros sobre viagens agendadas e chats.
- **Chat Interno:** Comunicação em tempo real entre motoristas e passageiros utilizando WebSockets (`Socket.io`).
- **Geração de Relatórios:** Relatórios gerenciais exportáveis em formatos **PDF** e **CSV**.
- **Testes Automatizados:** Cobertura de testes unitários e de integração validando fluxos críticos no Frontend (Vitest) e Backend (Jest).

## Requisitos Funcionais

### 1. Gestão de Perfis e Segurança Institucional
- **REQ01**: Realizar o cadastro e autenticação de usuários obrigatoriamente via e-mail institucional @ufrpe.br.
- **REQ02**: Implementar verificação de perfil vinculando o usuário ao seu curso ou departamento.
- **REQ03**: Gerenciar sistema de reputação e avaliações após cada viagem para garantir a confiabilidade da comunidade.

### 2. Viagens
- **REQ04**: Gerenciamento de Caronas (CRUD): Permitir que motoristas criem, editem e removam ofertas de carona com detalhes de trajeto e vagas.
- **REQ05**: Filtrar e sugerir caronas automaticamente com base na compatibilidade de rotas entre motorista e passageiro.
- **REQ06**: Sugerir valores de contribuição baseados na distância e consumo médio do veículo.
- **REQ07**: Atualizar automaticamente a disponibilidade do veículo conforme reservas são confirmadas.

### 3. Logística e Comunicação
- **REQ09**: Permitir o agendamento antecipado de caronas para até 5 dias da semana.
- **REQ10**: Chat interno para facilitar a comunicação entre os membros da carona sem a necessidade de expor números de telefone pessoais.

### 4. Sustentabilidade e Governança
- **REQ11**: Calcular a estimativa de redução de emissão de CO2 e disponibilizar para usuário após a finalização da carona.
- **REQ12**: Arquivar automaticamente caronas após o início da viagem.
- **REQ13**: Permitir que administradores bloqueiem usuários denunciados ou perfis não validados.
- **REQ14**: Gerar relatórios sobre a eficiência do transporte compartilhado, mostrando a redução na geração de CO2 e confiabilidade dos usuários no sistema, em formato PDF e CSV.

## Requisitos Não Funcionais
- **RNF01**: O sistema deve possuir uma interface responsiva, garantindo uma navegação fluida em dispositivos móveis e desktops.
- **RNF02**: O sistema deve tratar os dados dos usuários em conformidade com a LGPD, garantindo que as senhas sejam criptografadas e protegidas.
- **RNF03**: A comunicação do Frontend e Backend deve ser separada através de uma API RESTful consumindo e enviando JSON.
- **RNF04**: A geração de relatórios administrativos deve ser processada majoritariamente no lado do cliente (Frontend) para poupar recursos do servidor.
- **RNF05**: O código deve possuir validação automatizada contínua (Testes) para evitar regressões nas funcionalidades principais do MVP.
  
## 🛠️ Tecnologias Utilizadas (Stack) e Pacotes Instalados

### Frontend (React.js + Vite)
- **Pacotes principais:** `react`, `react-dom`, `react-router-dom`
- **Requisições HTTP:** `axios`
- **Ícones:** `lucide-react`
- **Geração de relatórios:** `jspdf`, `jspdf-autotable`
- **Websockets:** `socket.io-client` (para o chat)
- **Testes Automatizados:** `vitest`, `@testing-library/react`

### Backend (Node.js + Express)
- **Framework:** `express`
- **Banco de Dados:** `sqlite`, `sqlite3`
- **Segurança:** `bcrypt` (hashing de senhas), `crypto` (tokens)
- **Comunicação em Tempo Real:** `socket.io`
- **Envio de E-mails:** `nodemailer`
- **Requisições Cruzadas:** `cors`
- **Testes Automatizados:** `jest`, `supertest`

## ⚙️ Como Executar o Projeto Localmente (Em outra máquina)

Se você clonou o projeto em uma nova máquina, será necessário instalar as dependências de cada pasta antes de rodar a aplicação.

### 1. Preparar e Iniciar o Backend
Abra um terminal, acesse a pasta `backend` e execute os comandos:
```bash
cd backend
npm install
npm run dev
```
*(O banco de dados `database.sqlite` será criado e estruturado automaticamente na primeira execução).*

### 2. Preparar e Iniciar o Frontend
Abra um novo terminal (mantendo o backend rodando), acesse a pasta `frontend` e execute:
```bash
cd frontend
npm install
npm run dev -- --host
```
*(A aplicação ficará disponível no seu navegador, geralmente em `http://localhost:5173` ou pelo IP da sua rede).*
