# Plano de Testes — Sauce Demo Automation

## 1. Contexto e objetivo

Segundo projeto de prática de automação com Playwright + TypeScript, com um domínio diferente do
primeiro (e-commerce, em vez de reserva de hotel). 

**Aplicação-alvo:** [Sauce Demo](https://www.saucedemo.com) ("Swag Labs"), aplicação de e-commerce
mantida pela Sauce Labs especificamente para prática de automação de testes.

## 2. Usuários de teste disponíveis

| Usuário                  | Senha         | Comportamento                                                        |
|---------------------------|---------------|-----------------------------------------------------------------------|
| `standard_user`            | `secret_sauce` | Fluxo normal, sem problemas                                            |
| `locked_out_user`          | `secret_sauce` | Login bloqueado — mostra mensagem de erro                             |
| `problem_user`             | `secret_sauce` | Login funciona, mas a aplicação tem bugs visuais propositais |
| `performance_glitch_user`  | `secret_sauce` | Login funciona, mas com lentidão proposital (bom para observar timeouts) |
| `error_user`               | `secret_sauce` | Dispara erros em ações específicas do checkout                        |
| `visual_user`              | `secret_sauce` | Pequenas diferenças visuais propositais (candidato a teste de regressão visual) |

## 3. Escopo

### Dentro do escopo (v1)

- Login: caminho feliz e negativo (`locked_out_user`)
- Listagem de produtos: os 6 produtos aparecem, ordenação (Name A-Z/Z-A, Price low-high/high-low)
- Adicionar/remover produto do carrinho, contador do ícone do carrinho
- Checkout completo: informações do comprador → resumo do pedido → confirmação
- Pelo menos um teste explorando `problem_user` ou `visual_user`, documentando o que for encontrado

### Fora do escopo (v1 — backlog)

- `performance_glitch_user` / medição de performance (fica para uma fase de performance, como no projeto do Restful-Booker)
- `error_user` (cenários de erro no checkout) — bom candidato para v2
- Testes de acessibilidade e cross-browser

## 4. Estratégia de testes (baseada em risco)

| Área                          | Risco | Tipo de teste | Por quê |
|-------------------------------|-------|-----------------|---------|
| Login (caminho feliz e `locked_out_user`) | Alto | E2E | Porta de entrada de tudo — se quebrar, nada mais importa |
| Adicionar ao carrinho / contador | Alto | E2E | Ação central do fluxo de compra |
| Checkout completo (3 passos)     | Alto | E2E | Fluxo de conversão, maior impacto de negócio |
| Ordenação de produtos            | Médio | E2E | Visível ao usuário, mas não bloqueia a compra |
| Bugs visuais do `problem_user`   | Médio | Exploratório + E2E | Risco baixo de produção real, mas alto valor de aprendizado (achar e documentar bug) |

## 5. Casos de teste sugeridos (para você implementar)

| ID     | Cenário                                                                 | Prioridade |
|--------|--------------------------------------------------------------------------|------------|
| UI-01  | Login com `standard_user` leva à página de produtos                      | Alta       |
| UI-02  | Login com `locked_out_user` mostra mensagem de erro e não avança          | Alta       |
| UI-03  | Adicionar um produto ao carrinho atualiza o contador do ícone             | Alta       |
| UI-04  | Remover um produto do carrinho volta o botão para "Add to cart"           | Média      |
| UI-05  | Ordenar por "Price (low to high)" exibe os produtos na ordem correta      | Média      |
| UI-06  | Completar o checkout (nome, sobrenome, CEP) chega até "Thank you for your order!" | Alta |
| UI-07  | Checkout sem preencher um campo obrigatório mostra mensagem de erro       | Média      |
| UI-08  | (Exploratório) Comparar visualmente `problem_user` com `standard_user` e documentar qualquer diferença com o template de bug | Baixa |

Sugestão de nomenclatura de arquivos: `tests/ui/login.spec.ts`, `tests/ui/cart.spec.ts`,
`tests/ui/checkout.spec.ts`.

## 6. Estrutura sugerida (Page Object Model)


- `LoginPage.ts` — campos de usuário/senha, método `login(username, password)`
- `InventoryPage.ts` — lista de produtos, `addToCart(productName)`, `sortBy(option)`, contador do carrinho
- `CartPage.ts` — itens no carrinho, botão de checkout
- `CheckoutStepOnePage.ts` / `CheckoutStepTwoPage.ts` — formulário de dados e resumo do pedido

## 7. Ambiente e dados de teste

- **Ambiente:** aplicação pública de demonstração (URL configurável via `.env`, `BASE_URL`)
- **Dados:** os 6 produtos e os 6 usuários são fixos (não é preciso gerar dados dinamicamente
  como no projeto de reservas)

## 8. Critérios de entrada e saída

**Entrada:** ambiente configurado (`.env` )

**Saída (definição de pronto da v1):** casos de teste da seção 5 implementados e passando,
pipeline de CI verde, relatório HTML publicado como artefato.

## 9. Roadmap

1. **Fase 1:** `LoginPage` + testes UI-01 e UI-02
2. **Fase 2:** `InventoryPage` + testes UI-03, UI-04, UI-05
3. **Fase 3:** Checkout completo (UI-06, UI-07)
4. **Fase 4:** Exploratório com `problem_user`/`visual_user` (UI-08) + documentar achado com `docs/BUG_REPORT_TEMPLATE.md` do outro projeto
5. **Fase 5 (backlog):** `error_user`, `performance_glitch_user`, regressão visual
