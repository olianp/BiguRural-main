# 📋 Relatório Consolidado de Evidências de Teste
**Projeto:** Bigu Rural
**Escopo:** Todos os Módulos (Requisitos Funcionais e Não Funcionais)
**Status Geral:** ✅ APROVADO (100% de Sucesso)

---

## 🎯 Objetivo Geral
Apresentar as evidências de validação sistêmica, garantindo que todas as regras de negócio, integrações e restrições técnicas do MVP foram testadas e aprovadas, tanto através de testes automatizados (Frontend e Backend) quanto por homologação prática de fluxo de usuário.

---

## 🛠️ Módulo 1: Validações Técnicas e Arquiteturais (RNFs)
**Status:** ✅ Validado
* **RNF01 (Interface Responsiva):** Telas validadas em resoluções mobile (ex: iPhone SE) e desktop. Os componentes de grid (`Home`, `Buscar Carona`) e o Header (`position: sticky`) se adaptaram sem quebra de layout.
* **RNF02 (Segurança/LGPD):** Evidenciado no banco de dados SQLite que as senhas foram salvas utilizando o algoritmo de Hash `bcrypt` (irreversível a olho nu) e não em texto limpo.
* **RNF03 (API RESTful):** Testes de rota provaram a comunicação via JSON entre o cliente (React/Axios) e o servidor (Node.js/Express). Tentativas de acesso a rotas inexistentes retornaram corretamente o status HTTP `404 Not Found`.
* **RNF04 (Processamento de Relatórios):** A geração dos arquivos PDF e CSV foi validada no lado do cliente (via bibliotecas `jsPDF` e `autoTable`), reduzindo o consumo de memória RAM do Backend.
* **RNF05 (Testes Automatizados):** As suítes do Vitest (UI) e Jest (API) rodaram perfeitamente e cobriram os cenários lógicos. Extrato oficial no final deste documento.

---

## 👤 Módulo 2: Entrada e Identidade (Segurança Institucional)
**Status:** ✅ Validado
* **REQ01 (Cadastro Seguro):** Testado o bloqueio de domínios pessoais (`@gmail.com`) retornando o erro `400 Bad Request`. O envio do token de verificação transiente e redefinição de senha foram aprovados. 
* **REQ02 (Verificação de Perfil):** Homologada a atualização segura do Perfil. Edições de nome e matrícula refletem imediatamente no banco de dados e atualizam a sessão local (`localStorage`).

---

## 🚗 Módulo 3: Logística e Criação da Viagem (Motorista)
**Status:** ✅ Validado
* **REQ04 (CRUD e Trava de Veículos):** Ao tentar publicar uma carona sem veículo prévio, o sistema barrou a ação e redirecionou o usuário para `/cadastro-veiculo`. O autopreenchimento de vagas de acordo com o modelo de carro funcionou.
* **REQ06 e REQ09 (Rotas e Sugestões):** Valor da colaboração ("A combinar") e Ponto de Encontro mapeados e exibidos perfeitamente no detalhamento da carona.
* **REQ10 (Agendamento Antecipado):** Travas temporais validadas. Tentativa de publicação com data no passado bloqueada pelo seletor de tela nativo.

---

## 🔎 Módulo 4: O Lado do Passageiro (Busca e Vagas)
**Status:** ✅ Validado
* **REQ05 (Filtro Inteligente):** Pesquisa cruzando Origem e Destino via inputs rendeu resultados em tempo real (`onChange`). Buscas fora do campus renderizaram a string "Nenhuma carona encontrada." sem gerar crash na tela.
* **REQ07 (Vagas em Tempo Real):** Ao clicar em "Solicitar Carona", a requisição injetou a reserva no banco e abateu a vaga principal (Ex: 3 vagas caem instantaneamente para 2). Bloqueio operante em viagens com 0 vagas ("Esgotado!").
* **REQ08 (Localização / GPS):** A injeção da rota na API concatenou Origem e Destino com sucesso, acionando a aplicação nativa do Google Maps no mobile/desktop.
* **REQ13 (Arquivamento Dinâmico):** Testado cruzamento de data/hora no Frontend. Viagens no passado são tratadas como concluídas/arquivadas e saem das listas públicas de buscas.

---

## 💬 Módulo 5: Viagem, Confiança e Sustentabilidade
**Status:** ✅ Validado
* **REQ03 (Avaliações e Reputação):** Submissão de avaliação testada (1 a 5 estrelas). O cálculo consolidou a média da nota do motorista em ponto flutuante e alimentou estatísticas do perfil.
* **REQ11 (Chat Interno):** Conexão via WebSockets (`Socket.io`) estabelecida. Mensagens da sala (`carona_id`) carregam instantaneamente na tela sem a necessidade de expor telefones particulares ou realizar `refresh` na página.
* **REQ12 (Sustentabilidade/CO2):** O painel do Perfil calculou adequadamente a quantidade de `kg de CO2` economizados pela comunidade acadêmica baseado nos agrupamentos (GROUP BY) de caronas finalizadas.

---

## 🛡️ Módulo 6: Administração e Moderação
**Status:** ✅ Validado
* **REQ14 (Denúncia Dinâmica e Banimento):** O combobox provou o relacionamento limitando a denúncia apenas a motoristas com quem houve a viagem. No painel Admin, a ação "Banir" ativou o `DELETE CASCADE` (apagando usuário, ofertas e reservas vinculadas a ele).
* **REQ15 (Relatórios Gerenciais):** A inserção das novas colunas `CO2 Poupado` e `Valor Sugerido` fluiu na API e serviu a construção perfeita do documento `Relatorio_Bigu_Rural.pdf` e sua contraparte `.csv`.

---

## 📊 Extrato Oficial dos Testes Automatizados (RNF05)

Abaixo estão os logs atestando a cobertura técnica livre de falhas ou regressões para as regras centrais do MVP:

**[LOG DO BACKEND - JEST / SUPERTEST]**
```text
 PASS  __tests__/api.test.js
  ✓ [Sucesso] Deve retornar 200 OK na rota principal (Status do Servidor)
  ✓ [Falha] Deve retornar erro 404 ao acessar uma rota inexistente

 PASS  __tests__/auth.test.js
  ✓ GET / deve informar que a API está funcionando
  ✓ deve cadastrar usuário com e-mail institucional @ufrpe.br
  ✓ não deve cadastrar usuário com e-mail pessoal
  ✓ não deve fazer login com senha incorreta
  ✓ deve fazer login com usuário verificado e senha correta

 PASS  __tests__/caronas.test.js
  ✓ deve criar uma carona com dados válidos em POST /api/oferecer
  ✓ não deve criar carona sem campos obrigatórios
  ✓ deve listar caronas cadastradas em GET /api/caronas
  ✓ deve reservar vaga e diminuir a quantidade disponível
  ✓ não deve reservar vaga quando a carona está esgotada
  ✓ deve registrar avaliação válida do motorista
  ✓ não deve aceitar avaliação fora de 1 a 5

Test Suites: 3 passed, 3 total
Tests:       14 passed, 14 total
```

**[LOG DO FRONTEND - VITEST / RTL]**
```text
 RUN  v3.2.4 C:/Users/calex/Documents/Bigu_Rural/BiguRural-main/frontend

 ✓ src/test/OferecerCarona.test.jsx (3 tests)
   ✓ Cenário 1: [Sucesso] Deve publicar uma carona com sucesso...
   ✓ Cenário 2: [Falha Tratada] Deve exibir alerta de erro...
   ✓ Cenário 3: [Falha Tratada] Deve bloquear a publicação sem veículo...
 ✓ src/__tests__/OferecerCarona.test.jsx (4 tests)
   ✓ Frontend - Tela de Oferecer Carona > deve exibir campos...
 ✓ src/__tests__/Login.test.jsx (4 tests)
 ✓ src/__tests__/Cadastro.test.jsx (5 tests)

 Tests  16 passed (16)
```