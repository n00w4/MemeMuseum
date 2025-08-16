import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent,
        title: "Login | MEMEMUSEUM"
    },
    {
        path: 'home',
        component: HomeComponent,
        title: 'Home | MEMEMUSEUM'
    },
    {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
    }
];
