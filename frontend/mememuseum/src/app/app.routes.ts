import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';
import { MemeOfTheDayComponent } from './components/memes/meme-of-the-day/meme-of-the-day';
import { MemeUploadComponent } from './components/memes/meme-upload/meme-upload';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login | MEMEMUSEUM',
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Home | MEMEMUSEUM',
  },
  {
    path: 'meme-of-the-day',
    component: MemeOfTheDayComponent,
    title: 'Meme Of The Day | MEMEMUSEUM',
  },
  {
    path: 'upload',
    component: MemeUploadComponent,
    title: 'Upload Meme | MEMEMUSEUM',
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
