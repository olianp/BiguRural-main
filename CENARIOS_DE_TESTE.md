# Cenários de Teste - Bigu Rural

Este documento descreve os cenários de teste propostos para a validação dos requisitos Funcionais e Não Funcionais do sistema **Bigu Rural**. Para cada requisito, são apresentados 3 cenários, incluindo testes de sucesso e testes de exceção/falha.

---

## Requisitos Funcionais

### REQ01: Cadastro e autenticação obrigatoriamente via e-mail institucional
- **[Sucesso] Cenário 1:** O usuário preenche todos os campos corretamente com um e-mail terminado em `@ufrpe.br`. O sistema cria a conta com sucesso e envia o token de ativação.
- **[Falha] Cenário 2:** O usuário tenta se cadastrar utilizando um e-mail pessoal (ex: `usuario@gmail.com`). O sistema bloqueia a ação e exibe o erro "Apenas e-mails @ufrpe.br são permitidos".
- **[Falha] Cenário 3:** O usuário tenta realizar o login com um e-mail `@ufrpe.br` válido, porém digitando a senha errada. O sistema nega o acesso retornando o status HTTP 401 e exibe "Senha incorreta".

### REQ02: Verificação de perfil vinculando usuário ao curso
- **[Sucesso] Cenário 1:** O usuário, após fazer login, entra na tela de edição, adiciona seu curso válido (ex: "Sistemas de Informação") e clica em salvar. Os dados são atualizados com sucesso.
- **[Falha] Cenário 2:** O usuário tenta salvar os dados do perfil mas deixa o campo "Curso/Departamento" em branco. O sistema barra a atualização e exibe o erro "Campo obrigatório".
- **[Falha] Cenário 3:** O usuário mal-intencionado tenta forçar o envio de um dado inválido (ex: injeção de script ou caracteres especiais) no campo de curso. O sistema filtra os dados e barra a edição.

### REQ03: Gerenciar sistema de reputação e avaliações
- **[Sucesso] Cenário 1:** Após concluir a viagem, o passageiro avalia o motorista com 5 estrelas. A nova média do motorista é recalculada e atualizada instantaneamente no banco de dados.
- **[Falha] Cenário 2:** O passageiro tenta enviar uma nota inválida (ex: 6 estrelas ou um texto ao invés de números). O frontend impede o envio e exibe "Nota inválida! Por favor, digite um número de 1 a 5".
- **[Falha] Cenário 3:** Um usuário tenta avaliar um motorista com o qual ele nunca viajou através de requisições na API. O backend retorna erro de validação negando a permissão.

### REQ04: Gerenciamento de Caronas (CRUD)
- **[Sucesso] Cenário 1:** O motorista preenche a Origem, Destino, Horário e Vagas na tela de "Oferecer Carona". O sistema cadastra a viagem e a exibe na listagem pública de buscas.
- **[Falha] Cenário 2:** O motorista tenta publicar uma carona sem definir o número de vagas. O sistema avisa "Por favor, preencha todos os campos" e a viagem não é criada.
- **[Falha] Cenário 3:** O motorista tenta excluir uma carona que já foi iniciada ou que já está no passado. O sistema bloqueia a ação para manter o histórico inalterado.

### REQ05: Filtrar e sugerir caronas automaticamente
- **[Sucesso] Cenário 1:** O usuário digita "Recife" no campo de origem e "UFRPE" no destino. O sistema filtra instantaneamente e exibe os cards apenas com as caronas correspondentes.
- **[Falha] Cenário 2:** O usuário busca por uma rota que não possui nenhuma oferta (ex: "Carpina" -> "UFRPE"). A lista retorna em branco com a mensagem "Nenhuma carona encontrada".
- **[Falha] Cenário 3:** O sistema de busca recebe acidentalmente parâmetros nulos na pesquisa, retornando toda a lista sem quebrar a aplicação (falha silenciosa evitada).

### REQ06: Sugerir valores de contribuição
- **[Sucesso] Cenário 1:** Ao criar a carona, o sistema calcula a distância usando uma API de rotas e sugere automaticamente uma colaboração justa (ex: R$ 5,00) com base no KM rodado.
- **[Falha] Cenário 2:** A API externa do Google Maps está fora do ar. O sistema lida com a falha e avisa "Não foi possível calcular o valor sugerido. Defina como 'A combinar'".
- **[Falha] Cenário 3:** Um erro lógico tenta calcular a contribuição de uma distância igual a zero. O sistema detecta e impede que o valor retorne negativo ou incorreto.

### REQ07: Atualizar automaticamente disponibilidade do veículo
- **[Sucesso] Cenário 1:** Uma carona tem 3 vagas. O passageiro reserva 1 vaga; o sistema debita imediatamente e exibe "2 vagas restantes" para os próximos na tela de Busca.
- **[Falha] Cenário 2:** O passageiro tenta reservar vaga em uma carona que já atingiu 0 vagas. O sistema bloqueia o clique ou a requisição e exibe "Vagas esgotadas".
- **[Falha] Cenário 3:** O próprio motorista clica acidentalmente em "Solicitar Carona" na sua viagem. O sistema avisa "Você não pode solicitar vaga na sua própria carona".

### REQ08: Agendamento antecipado (até 5 dias)
- **[Sucesso] Cenário 1:** Na quinta-feira, o motorista agenda uma carona para a segunda-feira seguinte (dentro do limite). A carona é listada com sucesso no sistema.
- **[Falha] Cenário 2:** O motorista tenta agendar uma carona para daqui a 15 dias. O sistema exibe "O limite máximo para agendamento é de 5 dias".
- **[Falha] Cenário 3:** O motorista tenta agendar uma viagem cuja data é referente a um dia que já passou (ontem). O sistema bloqueia por data inválida.

### REQ09: Chat interno
- **[Sucesso] Cenário 1:** Após a reserva, um botão de "Chat" é habilitado. O passageiro envia "Chego em 5 min" e o motorista recebe sem expor seu telefone pessoal.
- **[Falha] Cenário 2:** Usuário tenta contatar um passageiro através de uma carona já encerrada há vários dias. O sistema exibe o chat apenas como "Leitura" (histórico) e bloqueia envio.
- **[Falha] Cenário 3:** A conexão cai no momento de enviar a mensagem no chat. O sistema não envia o texto e avisa "Falha de conexão. Tente novamente".

### REQ10: Redução de emissão de CO2
- **[Sucesso] Cenário 1:** O motorista clica em "Finalizar Viagem". A aplicação contabiliza os quilômetros rodados em grupo e informa na tela "A carona de vocês poupou X kg de CO2!".
- **[Falha] Cenário 2:** A viagem foi criada e o passageiro reservou, mas o motorista a cancelou antes de iniciar. O cálculo de CO2 tenta rodar, mas é bloqueado porque o status é 'Cancelada'.
- **[Falha] Cenário 3:** Houve um erro no algoritmo que gera o cálculo ou os KMs são dados inválidos, a API retorna um erro, o app captura sem travar e não contabiliza CO2 falso.

### REQ11: Arquivar automaticamente caronas
- **[Sucesso] Cenário 1:** O horário definido para a carona expira. Na consulta do banco de dados, o status muda automaticamente para 'Concluída/Arquivada', removendo-a das buscas ativas.
- **[Falha] Cenário 2:** O Job ou regra do servidor falha, e uma carona de ontem ainda aparece ativa nas buscas. O sistema precisa garantir uma trava temporal na view do Frontend para não deixá-la clicável.
- **[Falha] Cenário 3:** Tenta-se arquivar uma carona cujo passageiro ainda está como "Pendente" ou "Em andamento". O arquivamento acusa status conflitante e resolve a pendência.

### REQ12: Administradores bloqueiam usuários
- **[Sucesso] Cenário 1:** Administrador entra na ferramenta gerencial e bane o ID do usuário devido a múltiplas denúncias de má conduta.
- **[Falha] Cenário 2:** Administrador acidentalmente tenta banir o próprio ID da sua sessão. O sistema o impede, alegando "Você não pode banir seu próprio usuário administrador".
- **[Falha] Cenário 3:** Usuário que já foi banido tenta relogar. O sistema devolve "Sua conta foi desativada, procure a administração" em vez de logar o indivíduo.

### REQ13: Gerar relatórios PDF e CSV
- **[Sucesso] Cenário 1:** O Administrador clica em "Baixar PDF". O script JS captura os dados das médias do motorista, anexa a logomarca via base64, e entrega um arquivo PDF perfeito.
- **[Falha] Cenário 2:** O banco de dados está vazio (nenhuma carona/usuário no dia). Ao pedir o relatório CSV, ele apenas devolve a linha de cabeçalhos sem dar Crash no sistema.
- **[Falha] Cenário 3:** Um usuário sem permissão de Administrador intercepta a rota de extração `/api/relatorio`. O backend bloqueia gerando HTTP 403 Forbidden.

---

## Requisitos Não Funcionais

### RNF01: Interface Responsiva
- **[Sucesso] Cenário 1:** O site é acessado por um aparelho iPhone SE (largura 375px). Os inputs da busca e botões empilham na vertical, ficando 100% amigáveis para toque.
- **[Falha] Cenário 2:** Um botão ou tabela de detalhes de viagem excede a largura da tela em um mobile. A página sofre scroll horizontal quebrando o layout.
- **[Falha] Cenário 3:** Num monitor Ultrawide enorme, a tela inicial estica excessivamente e o avatar do usuário distorce visualmente.

### RNF02: Proteção de dados e Criptografia (LGPD)
- **[Sucesso] Cenário 1:** Quando um usuário é salvo no SQLite, sua coluna "senha" passa pelo algoritmo bcrypt, transformando "12345" num Hash de 60 caracteres aleatórios indescritíveis.
- **[Falha] Cenário 2:** Caso ocorra um vazamento hipotético do arquivo `database.sqlite`, as senhas expostas tentarão ser lidas, mas estão irrecuperáveis a olho nu graças ao Hash, protegendo os usuários. (Situação de sucesso de arquitetura sob falha de segurança perimetral).
- **[Falha] Cenário 3:** O token gerado por criptografia falha em sua geração devido à biblioteca "crypto" offline. O usuário não consegue o cadastro pois o dado obrigatório não pôde ser assegurado.

### RNF03: API RESTful (JSON)
- **[Sucesso] Cenário 1:** O Frontend (Axios) faz um POST em `/api/auth/login` mandando JSON. O Backend entende, valida no banco, e devolve `200 OK` com dados também em formato JSON.
- **[Falha] Cenário 2:** O sistema externo tenta buscar caronas através de chamadas GET em endpoints não registrados ou em métodos trocados (ex: POST ao invés de GET). O servidor retorna HTTP 404 (Not Found).
- **[Falha] Cenário 3:** A API recebe os dados com Content-Type equivocado (ex: `text/html`). O Express não faz o parse (body vazio) e retorna erro de Bad Request (400).

### RNF04: Processamento de relatórios majoritariamente no Frontend
- **[Sucesso] Cenário 1:** O backend devolve apenas o objeto `Array` com os dados brutos e leves. O navegador do cliente (jsPDF) é quem consome a CPU para desenhar linhas e salvar o PDF.
- **[Falha] Cenário 2:** A API devolve 1 milhão de registros para a geração de um único arquivo PDF e excede a RAM que o JavaScript disponibiliza no navegador, forçando um recarregamento da aba "Ah Não! A página travou".
- **[Falha] Cenário 3:** A biblioteca externa AutoTable sofre erro ao calcular o espaçamento das colunas por causa de um texto muito longo, desformatando o PDF do lado do cliente.

### RNF05: Validação automatizada contínua (Testes)
- **[Sucesso] Cenário 1:** O desenvolvedor executa `npm test` na pasta `frontend`. O Vitest roda a suíte de testes do componente `OferecerCarona`, valida a renderização e o disparo correto da API, retornando 100% de sucesso ("Passed").
- **[Falha] Cenário 2:** Uma alteração acidental no código remove um campo obrigatório da tela. Ao rodar os testes automatizados, o sistema falha instantaneamente, indicando que o elemento esperado não foi encontrado, evitando falhas silenciosas na UI.
- **[Falha] Cenário 3:** No backend, a suíte do Jest roda para testar o bloqueio de cadastro de usuários. O teste simula um cadastro com e-mail pessoal e confirma que a API barrou a requisição adequadamente (400 Bad Request).