# Sauce Demo Automation

Segundo projeto de prática de automação de testes com **Playwright + TypeScript**, com foco em
e-commerce.

**Aplicação-alvo:** [Sauce Demo](https://www.saucedemo.com) ("Swag Labs"), aplicação de e-commerce
mantida pela Sauce Labs especificamente para prática de automação.

## Estado atual do projeto

Este repositório é entregue **de propósito sem nenhum teste implementado**. O que já está pronto:

- Configuração do Playwright (`playwright.config.ts`)
- Pipeline de CI no GitHub Actions (`.github/workflows/playwright.yml`)
- `.env.example` com a URL da aplicação e os usuários de teste
- Estrutura de pastas para Page Objects (`src/pages/`), fixtures (`src/fixtures/`) e testes
  (`tests/ui/`)
- **[`docs/TEST_PLAN.md`](docs/TEST_PLAN.md)** — plano de testes completo (escopo, estratégia
  baseada em risco, casos de teste sugeridos e roadmap em fases)

## Stack

- [Playwright](https://playwright.dev/) + TypeScript
- Page Object Model (POM)
- GitHub Actions para CI
- Relatório HTML do Playwright publicado como artefato de CI

## Como começar

```bash
npm install
cp .env.example .env
npx playwright test        # vai rodar "sem testes encontrados" até você criar os specs
```

## Roteiro de implementação

Siga o roadmap da seção 9 de [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md):

1. `LoginPage` + testes de login (UI-01, UI-02)
2. `InventoryPage` + testes de carrinho e ordenação (UI-03, UI-04, UI-05)
3. Checkout completo (UI-06, UI-07)
4. Exploração com `problem_user` / `visual_user` (UI-08), documentando qualquer achado com o
   template de bug do outro projeto
5. Backlog: `error_user`, `performance_glitch_user`, regressão visual

## Usuários de teste

Ver a tabela completa em [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md#2-usuários-de-teste-disponíveis).
Todos usam a senha `secret_sauce`.
