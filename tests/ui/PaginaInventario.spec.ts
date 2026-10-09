import { PaginaInventario } from "@pages/PaginaInventario";
import { PaginaLogin } from "@pages/PaginaLogin";
import test, { expect } from "@playwright/test";
import { inteiroAleatorio, sortearIndices } from "../../src/utils/aleatorio";
test.describe('Pagina de Inventario', () => {
    test('UI-03 - Adicionar um produto ao carrinho atualiza o contador do ícone', async ({ page }) => {
        const paginaInventario = new PaginaInventario(page);
        const paginaLogin = new PaginaLogin(page)

        await paginaLogin.acessar();
        await paginaLogin.fazerLogin('standard_user');
        await expect(page).toHaveURL(/inventory/);
        await expect(paginaInventario.itens.first()).toBeVisible();

        const total = await paginaInventario.itens.count();
        const quantidade = inteiroAleatorio(1, total);
        const indices = sortearIndices(total, quantidade);

        const escolhidos: string[] = [];
        for (const indice of indices) {
            escolhidos.push((await paginaInventario.nomesProdutos.nth(indice).textContent()) ?? '');
            await paginaInventario.adicionarProdutoAoCarrinho(indice);
        }

        test.info().annotations.push({
            type: 'produtos',
            description: `${quantidade} produto(s): ${escolhidos.join(', ')}`,
        });
        
        await expect(paginaInventario.badgeCarrinho).toHaveText(String(quantidade));

    })

});