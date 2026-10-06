import { PaginaLogin } from "@pages/PaginaLogin";
import test, { expect } from "@playwright/test";

test.describe('Pagina de Login', () => {
    test('UI-01 - Login com `standard_user` leva à página de produtos', async({page}) => {
        const paginaLogin = new PaginaLogin(page);

        await paginaLogin.acessar();
        await paginaLogin.fazerLogin('standard_user');
        await expect(page).toHaveURL(/inventory/);
    }),
    test('UI-02 - Login com `locked_out_user` mostra mensagem de erro e não avança', async({page}) => {
        const paginaLogin = new PaginaLogin(page);

        await paginaLogin.acessar();
        await paginaLogin.fazerLogin('locked_out_user');

        await expect(paginaLogin.alertErro).toContainText('locked out');
        await expect(page).not.toHaveURL(/inventory/);

    })

});