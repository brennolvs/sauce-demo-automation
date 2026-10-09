# Sauce Demo Automation

[![Playwright Tests](https://github.com/brennolvs/sauce-demo-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/brennolvs/sauce-demo-automation/actions/workflows/playwright.yml)

Projeto de automação de testes end-to-end com **Playwright + TypeScript** para a aplicação
[Sauce Demo](https://www.saucedemo.com) ("Swag Labs"), um e-commerce para
prática de automação. Complementa o projeto
[restful-booker-automation](https://github.com/brennolvs/restful-booker-automation), que cobre
um domínio diferente (reserva de hotel, UI + API).

## Objetivo

Aplicar, em um fluxo de e-commerce, uma abordagem de testes baseada em risco: priorizar os
fluxos de maior impacto (login, carrinho e checkout), manter o código organizado com Page
Object Model e documentar o planejamento, as decisões e os resultados do projeto.

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) | Plano de testes: escopo, estratégia por risco, casos de teste, decisões de arquitetura, status de execução e registro de resultados |
| [`docs/BUG_REPORT_TEMPLATE.md`](docs/BUG_REPORT_TEMPLATE.md) | Template utilizado para registrar defeitos encontrados |

## Stack

- [Playwright](https://playwright.dev/) + TypeScript
- Page Object Model (POM)
- `dotenv` para configuração por variáveis de ambiente
- GitHub Actions para integração contínua, com relatório HTML publicado como artefato

## Estrutura do projeto

```
.
├── .github/workflows/playwright.yml   # pipeline de CI
├── docs/                              # plano de testes e template de bug
├── src/
│   ├── pages/                         # Page Objects (PaginaLogin, PaginaInventario)
│   ├── fixtures/                      # fixtures compartilhadas
│   └── utils/                         # funções utilitárias (ex.: sorteio de dados)
├── tests/ui/                          # specs de UI
├── playwright.config.ts
├── tsconfig.json                      # aliases: @pages/*, @fixtures/*, @utils/*
└── .env.example                       # modelo das variáveis de ambiente
```

## Como executar

Pré-requisitos: Node.js 20 ou superior.

```bash
npm install
npx playwright install chromium
```

Criar o arquivo `.env` a partir do modelo (o `.env` não é versionado):

```bash
# Linux / macOS
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Executar os testes:

```bash
npx playwright test             # modo headless
npx playwright test --ui        # modo interativo
npx playwright test -g "UI-03"  # executa apenas o caso de teste indicado
npx playwright show-report      # abre o relatório HTML da última execução
```

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `BASE_URL` | URL da aplicação (padrão: `https://www.saucedemo.com`) |
| `PASSWORD` | Senha comum a todos os usuários de teste |
| `STANDARD_USER`, `LOCKED_OUT_USER`, `PROBLEM_USER`, `PERFORMANCE_GLITCH_USER`, `ERROR_USER`, `VISUAL_USER` | Usuários de teste (ver [`.env.example`](.env.example)) |

No CI, as variáveis necessárias são definidas diretamente no workflow, pois o `.env` não faz
parte do repositório.

## Integração contínua

O workflow [`playwright.yml`](.github/workflows/playwright.yml) é executado a cada push e pull
request para `main`, e também pode ser disparado manualmente. Ele instala as dependências e o
Chromium, executa a suíte e anexa o relatório HTML (`playwright-report`) como artefato da
execução, com retenção de 14 dias. Para consultá-lo: aba **Actions** → execução desejada →
seção **Artifacts**.

## Decisões técnicas

- **Seletores:** a aplicação utiliza o atributo `data-test`; por isso o Playwright é configurado
  com `testIdAttribute: 'data-test'`, permitindo o uso de `getByTestId()`.
- **Asserções nos specs:** os Page Objects contêm apenas ações e locators. Todas as asserções
  (`expect`) ficam nos arquivos de teste, o que mantém cada cenário legível por si só e permite
  reaproveitar os Page Objects em fluxos positivos e negativos.
- **Locators expostos de forma seletiva:** apenas os elementos que o spec precisa verificar são
  públicos nos Page Objects; os demais permanecem privados.
- **Elementos repetidos por item:** botões de cada produto não são mapeados como propriedades
  fixas. Os Page Objects localizam o botão dentro do card do produto, a partir do índice, o que
  funciona para qualquer produto da lista.
- **Dados dinâmicos:** o UI-03 sorteia a quantidade e os produtos a cada execução, por meio de
  funções utilitárias em `src/utils/`. O sorteio nunca repete produto, pois o botão de um item
  já adicionado passa a ser "Remove". Os produtos escolhidos são registrados nas anotações do
  relatório para permitir a reprodução de falhas.
- **Credenciais:** a senha é lida de `process.env.PASSWORD`, sem valores fixos no código.

## Status de execução

| Fase | Escopo | Situação |
|------|--------|----------|
| 1 | `PaginaLogin` + UI-01 e UI-02 | Concluída |
| 2 | `PaginaInventario` + UI-03, UI-04 e UI-05 | Em andamento (UI-03 e UI-04 concluídos) |
| 3 | Checkout: UI-06 e UI-07 | Pendente |
| 4 | Exploratório com `problem_user` / `visual_user` (UI-08) | Pendente |
| 5 | Backlog: `error_user`, `performance_glitch_user`, regressão visual | Pendente |

O detalhamento por caso de teste, com data e resultado das execuções, está na seção 9 de
[`docs/TEST_PLAN.md`](docs/TEST_PLAN.md).

## Usuários de teste

Tabela completa em [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md#2-usuários-de-teste).
Todos utilizam a mesma senha, divulgada na própria página de login da aplicação.
