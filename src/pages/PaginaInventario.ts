import { Locator, Page } from "@playwright/test";

export type TiposOrdenacao =
    | 'Name (A to Z)' | 'Name (Z to A)' | 'Price (low to high)' | 'Price (high to low)';
export class PaginaInventario {
    private readonly page: Page;

    readonly itens: Locator
    readonly nomesProdutos: Locator;
    readonly precosProdutos: Locator;
    readonly badgeCarrinho: Locator;
    private readonly ordenacaoProdutos: Locator;


    constructor(page: Page) {

        this.page = page;

        this.itens = page.getByTestId('inventory-item');
        this.nomesProdutos = page.getByTestId('inventory-item-name');
        this.precosProdutos = page.getByTestId('inventory-item-price');
        this.badgeCarrinho = page.getByTestId('shopping-cart-badge');
        this.ordenacaoProdutos = page.getByTestId('product-sort-container');

    }
    botaoAdicionar(indice: number): Locator {
        return this.itens.nth(indice).getByRole('button', { name: 'Add to cart' });
    }

    botaoRemover(indice: number): Locator {
        return this.itens.nth(indice).getByRole('button', { name: 'Remove' });
    }

    async adicionarProdutoAoCarrinho(indice: number) {
        await this.botaoAdicionar(indice).click();
    }

    async removerProdutoDoCarrinho(indice: number) {
        await this.botaoRemover(indice).click();
    }

    async selecionaTipoOrdenacao(ordenacao: TiposOrdenacao) {
        await this.ordenacaoProdutos.selectOption(ordenacao);
    }

    async lerPrecos(): Promise<number[]> {
        const textos = await this.precosProdutos.allTextContents();
        return textos.map(texto => Number(texto.replace('$', '')));
    }

}