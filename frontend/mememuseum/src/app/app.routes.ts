import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { provideHttpClient } from '@angular/common/http';

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent,
        title: "Login | MEMEMUSEUM",
    },
    {
        path: "",
        redirectTo: "login",
        pathMatch: "full"
    }
];
