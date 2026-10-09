import { Page, Locator } from "@playwright/test";

export type TiposUsuarios = 
| 'standard_user' | 'locked_out_user' | 'problem_user' |'performance_glitch_user' | 'error_user' | 'visual_user';

export class PaginaLogin {
    private readonly page: Page;
    private readonly campoUserName: Locator;
    private readonly campoSenha: Locator;
    private readonly botaoLogin: Locator;
    readonly alertErro: Locator;

    constructor(page: Page) {
        this.page = page;

        this.campoUserName = page.getByTestId('username');
        this.campoSenha = page.getByTestId('password');
        this.botaoLogin =  page.getByTestId('login-button');
        this.alertErro = page.getByTestId('error');
    }

    async acessar(){
        await this.page.goto('/');
    }

    async fazerLogin(usuario: TiposUsuarios){

        await this.campoUserName.fill(usuario);
        await this.campoSenha.fill(process.env.PASSWORD!);
        await this.botaoLogin.click();
        
    }
}

