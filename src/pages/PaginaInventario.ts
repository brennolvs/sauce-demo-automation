import { Locator, Page } from "@playwright/test";

export class PaginaInventario {
    private readonly page: Page;

    readonly itens: Locator
    readonly nomesProdutos: Locator;
    readonly precosProdutos: Locator;
    readonly badgeCarrinho: Locator;


    constructor(page: Page) {

        this.page = page;

        this.itens = page.getByTestId('inventory-item');
        this.nomesProdutos = page.getByTestId('inventory-item-name');
        this.precosProdutos = page.getByTestId('inventory-item-price');
        this.badgeCarrinho = page.getByTestId('shopping-cart-badge');

    }
    async adicionarProdutoAoCarrinho(indice: number) {
        await this.itens.nth(indice).getByRole('button', { name: 'Add to cart' }).click();
    }
    
    async removerProdutoDoCarrinho(indice: number) {
        await this.itens.nth(indice).getByRole('button', { name: 'Remove' }).click();
    }
}