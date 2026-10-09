# Plano de Testes — Sauce Demo Automation

## 1. Contexto e objetivo

Este documento descreve o planejamento de testes automatizados de UI para o
[Sauce Demo](https://www.saucedemo.com), aplicação de e-commerce mantida para prática de automação. O projeto utiliza Playwright + TypeScript e Page Object
Model, e complementa o projeto
[restful-booker-automation](https://github.com/brennolvs/restful-booker-automation), que
cobre o domínio de reserva de hotel.

**Objetivo:** validar os fluxos de maior impacto de um e-commerce (autenticação, carrinho e
checkout) e documentar, de forma rastreável, a estratégia, as decisões técnicas, os resultados
das execuções e os defeitos encontrados.

O documento é atualizado a cada fase concluída. O status vigente de cada caso de teste está na
seção 9.

## 2. Usuários de teste

Todos os usuários utilizam a senha `secret_sauce`, divulgada na própria página de login.

| Usuário                  | Comportamento                                                                 |
|--------------------------|-------------------------------------------------------------------------------|
| `standard_user`          | Fluxo normal, sem problemas                                                   |
| `locked_out_user`        | Login bloqueado, com exibição de mensagem de erro                             |
| `problem_user`           | Login funciona, mas a aplicação apresenta defeitos visuais e funcionais propositais |
| `performance_glitch_user`| Login funciona, com lentidão proposital                                       |
| `error_user`             | Dispara erros em ações específicas do fluxo de compra                         |
| `visual_user`            | Diferenças visuais propositais (candidato a regressão visual)                 |

## 3. Escopo

### Dentro do escopo (v1)

- Login: caminho feliz e cenário negativo (`locked_out_user`)
- Listagem de produtos: exibição dos 6 produtos e ordenação (Name A-Z/Z-A, Price low-high/high-low)
- Adição e remoção de produto no carrinho, e contador do ícone do carrinho
- Checkout completo: informações do comprador, resumo do pedido e confirmação
- Teste exploratório com `problem_user` ou `visual_user`, com registro dos achados

### Fora do escopo (v1, backlog)

- `performance_glitch_user` e medição de performance
- `error_user` (cenários de erro no checkout), candidato à v2
- Testes de acessibilidade e cross-browser

## 4. Estratégia de testes (baseada em risco)

| Área                                       | Risco | Tipo               | Justificativa |
|--------------------------------------------|-------|--------------------|---------------|
| Login (caminho feliz e `locked_out_user`)  | Alto  | E2E                | Porta de entrada da aplicação; sua falha bloqueia todos os demais fluxos |
| Adicionar ao carrinho / contador           | Alto  | E2E                | Ação central do fluxo de compra |
| Checkout completo (3 passos)               | Alto  | E2E                | Fluxo de conversão, de maior impacto de negócio |
| Ordenação de produtos                      | Médio | E2E                | Visível ao usuário, mas não impede a compra |
| Defeitos do `problem_user`                 | Médio | Exploratório + E2E | Baixo risco de produção real, com valor para prática de identificação e documentação de defeitos |

## 5. Casos de teste

| ID    | Cenário                                                                          | Prioridade |
|-------|----------------------------------------------------------------------------------|------------|
| UI-01 | Login com `standard_user` direciona para a página de produtos                    | Alta       |
| UI-02 | Login com `locked_out_user` exibe mensagem de erro e não avança                  | Alta       |
| UI-03 | Adicionar produtos ao carrinho atualiza o contador do ícone                      | Alta       |
| UI-04 | Remover um produto do carrinho restaura o botão "Add to cart"                    | Média      |
| UI-05 | Ordenar por "Price (low to high)" exibe os produtos na ordem correta             | Média      |
| UI-06 | Concluir o checkout (nome, sobrenome, CEP) exibe "Thank you for your order!"     | Alta       |
| UI-07 | Checkout com campo obrigatório vazio exibe mensagem de erro                      | Média      |
| UI-08 | (Exploratório) Comparar `problem_user` e `standard_user` e registrar diferenças com o template de bug | Baixa |

Os arquivos de teste ficam em `tests/ui/`. Os títulos dos testes incluem o ID do caso
(por exemplo, `UI-01 - ...`), o que permite rastreabilidade no relatório e execução seletiva
com `npx playwright test -g "UI-02"`.

### 5.1 Estratégia de dados do UI-03

O UI-03 utiliza dados dinâmicos: a cada execução, a quantidade de produtos (de 1 ao total
disponível) e os produtos adicionados são sorteados. O objetivo é exercitar o contador com
combinações variadas, sem fixar um cenário único.

- O sorteio nunca repete produto, pois, após adicionado, o botão do item passa a ser "Remove"
  e um segundo clique removeria o produto em vez de incrementar o contador.
- O valor esperado do contador é a quantidade sorteada pelo teste, e não um valor lido da tela.
- A quantidade e os nomes dos produtos escolhidos são registrados nas anotações do relatório,
  para permitir a reprodução de qualquer falha.
- A aleatoriedade é uma decisão do teste (spec): os Page Objects não contêm lógica de sorteio.

Limitação conhecida: por ser aleatório, o UI-03 não garante a execução dos valores extremos
(1 produto e todos os produtos) em toda rodada. Cenários determinísticos para esses extremos
são candidatos a casos adicionais.

## 6. Arquitetura dos testes

### 6.1 Page Object Model

Os Page Objects ficam em `src/pages/` e seguem as convenções abaixo:

- Cada Page Object encapsula os locators e as ações de uma tela.
- Os Page Objects **não contêm asserções**. Todas as verificações (`expect`) ficam nos specs.
- Apenas os locators que o spec precisa verificar são expostos (`readonly` público); os demais
  são `private`.
- Elementos que se repetem por item de lista (como o botão de cada produto) não são mapeados
  como propriedades fixas. Eles são localizados dentro do card do produto, a partir do índice,
  pelos métodos da classe.
- Seletores utilizam `getByTestId()`, com `testIdAttribute: 'data-test'` configurado em
  `playwright.config.ts`.

| Classe                | Responsabilidade                                                    | Situação  |
|-----------------------|---------------------------------------------------------------------|-----------|
| `PaginaLogin`         | Campos de usuário e senha, `acessar()`, `fazerLogin(usuario)`, locator da mensagem de erro | Implementada |
| `PaginaInventario`    | Lista de produtos, nomes, preços, contador do carrinho; adicionar e remover produto por índice | Implementada (ordenação pendente, UI-05) |
| `PaginaCarrinho`      | Itens no carrinho e botão de checkout                               | Planejada |
| `PaginaCheckout`      | Formulário de dados do comprador, resumo e confirmação do pedido    | Planejada |

A senha é obtida de `process.env.PASSWORD`; não há credenciais fixas no código.

### 6.2 Utilitários e fixtures

- **`src/utils/`:** funções genéricas, independentes da aplicação e do Playwright (por exemplo,
  sorteio de inteiros e de índices distintos). São chamadas pelos specs.
- **`src/fixtures/`:** reservada para a preparação compartilhada entre testes (por exemplo, usuário
  já autenticado na página de inventário). A migração do login repetido nos specs para uma
  fixture está planejada para quando o mesmo preparo se repetir em três ou mais casos.

### 6.3 Aliases de importação

Definidos em `tsconfig.json`: `@pages/*`, `@fixtures/*` e `@utils/*`.

## 7. Ambiente e dados de teste

- **Ambiente:** aplicação pública de demonstração; URL configurável pela variável `BASE_URL`.
- **Dados:** os 6 produtos e os 6 usuários são fixos. Os dados variáveis dos testes (como a
  seleção de produtos do UI-03) são gerados em tempo de execução.
- **Configuração local:** arquivo `.env` criado a partir de `.env.example` (não versionado).
- **Configuração no CI:** variáveis definidas no workflow `.github/workflows/playwright.yml`.
- **Navegador:** Chromium (Desktop Chrome).

## 8. Critérios de entrada e saída

**Entrada:** ambiente configurado e dependências
instaladas.

**Saída (definição de pronto da v1):** casos de teste da seção 5 implementados e aprovados,
pipeline de CI verde e relatório HTML disponível como artefato da execução.

## 9. Status e resultados

### 9.1 Status por caso de teste

| ID    | Situação     | Último resultado | Data       | Ambiente   | Observações |
|-------|--------------|------------------|------------|------------|-------------|
| UI-01 | Implementado | Aprovado         | 2026-10-06 | Local e CI | Validação negativa realizada (senha inválida faz o teste falhar no `toHaveURL`) |
| UI-02 | Implementado | Aprovado         | 2026-10-06 | Local e CI | Verifica a mensagem de erro e que a URL não avança para `/inventory` |
| UI-03 | Implementado | Aprovado         | 2026-10-09 | Local e CI | Quantidade e produtos sorteados a cada execução (ver 5.1) |
| UI-04 | Implementado | Aprovado         | 2026-10-09 | Local e CI | Verifica o retorno do botão "Add to cart" após a remoção |
| UI-05 | Pendente     | —                | —          | —          | |
| UI-06 | Pendente     | —                | —          | —          | |
| UI-07 | Pendente     | —                | —          | —          | |
| UI-08 | Pendente     | —                | —          | —          | |

### 9.2 Integração contínua

| Item | Situação |
|------|----------|
| Workflow | `.github/workflows/playwright.yml` (disparo em push e pull request para `main`, e manual) |
| Execução | Instalação de dependências, instalação do Chromium, `npm test`, upload do relatório HTML como artefato |
| Variáveis no CI | `CI`, `BASE_URL` e `PASSWORD` definidas no passo de execução dos testes |
| Relatório | Disponível como artefato `playwright-report` da execução (retenção de 14 dias) |
| Última execução | Aprovada (2026-10-09) |

### 9.3 Registro de execuções

Cada execução relevante (conclusão de fase, regressão ou falha investigada) é registrada abaixo,
da mais recente para a mais antiga.

| Data       | Ambiente   | Escopo | Resultado | Notas |
|------------|------------|--------|-----------|-------|
| 2026-10-09 | Local e CI | UI-01 a UI-04 | 4 aprovados | Primeira execução bem-sucedida da suíte no GitHub Actions. UI-03 e UI-04 incluídos após a implementação de `PaginaInventario`. |
| 2026-10-06 | Local      | UI-01, UI-02 | 2 aprovados | Fase 1 concluída. Validação negativa do UI-01 com senha inválida confirmou falha no `toHaveURL`. |

### 9.4 Defeitos e observações

Defeitos identificados na aplicação são documentados com o template
[`BUG_REPORT_TEMPLATE.md`](BUG_REPORT_TEMPLATE.md) e listados abaixo.

| ID | Título | Severidade | Situação |
|----|--------|------------|----------|
| —  | Nenhum defeito registrado até o momento | — | — |

## 10. Roadmap

| Fase | Escopo | Situação |
|------|--------|----------|
| 1 | `PaginaLogin` + UI-01 e UI-02 | Concluída |
| 2 | `PaginaInventario` + UI-03, UI-04 e UI-05 | Em andamento (UI-03 e UI-04 concluídos) |
| 3 | Checkout completo: UI-06 e UI-07 | Pendente |
| 4 | Exploratório com `problem_user` / `visual_user` (UI-08), com documentação de achados via `BUG_REPORT_TEMPLATE.md` | Pendente |
| 5 | Backlog: `error_user`, `performance_glitch_user`, regressão visual | Pendente |