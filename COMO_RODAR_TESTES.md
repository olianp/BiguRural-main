# Como rodar os testes executáveis do Bigu Rural

Este projeto recebeu testes automatizados reais para o Backend e para o Frontend, usando as rotas e telas existentes no código.

## 1. Backend

Abra o terminal na pasta do backend:

```bash
cd backend
npm install
npm test
```

O comando `npm test` roda os testes com **Jest** e **Supertest**.

### O que os testes do Backend validam

- API principal respondendo em `/`.
- Cadastro com e-mail institucional em `/api/auth/cadastro`.
- Bloqueio de cadastro com e-mail pessoal.
- Login com senha incorreta em `/api/auth/login`.
- Login correto com usuário verificado.
- Criação de carona em `/api/oferecer`.
- Bloqueio de carona com campos obrigatórios vazios.
- Listagem de caronas em `/api/caronas`.
- Reserva de vaga em `/api/caronas/:id/reservar`.
- Bloqueio de reserva quando não há vagas.
- Avaliação válida e inválida em `/api/avaliar`.

## 2. Frontend

Abra outro terminal na pasta do frontend:

```bash
cd frontend
npm install
npm test
```

O comando `npm test` roda os testes com **Vitest** e **React Testing Library**.

### O que os testes do Frontend validam

- Tela de Login: campos, validação de campos vazios, bloqueio de e-mail pessoal e chamada da API.
- Tela de Cadastro: campos, validação de campos vazios, e-mail institucional, senha divergente e chamada da API.
- Tela de Oferecer Carona: campos, validação de obrigatoriedade, exigência de usuário logado e chamada da API.

## 3. Observação importante

Não precisa manter `node_modules` dentro do ZIP. O correto é rodar `npm install` nas pastas `backend` e `frontend`, pois isso instala as dependências corretas no seu computador.

## 4. Fala pronta para apresentação

> Para validar a qualidade do Bigu Rural, criamos testes automatizados no Backend e no Frontend. No Backend, usamos Jest e Supertest para testar as principais rotas da API, como cadastro, login, criação de caronas, reserva de vagas e avaliação de motoristas. No Frontend, usamos Vitest e React Testing Library para verificar se as telas exibem os campos corretamente, se as validações funcionam e se as chamadas para a API são feitas com os dados corretos. Esses testes ajudam a garantir que o sistema cumpra os principais requisitos funcionais e não funcionais definidos na documentação.
