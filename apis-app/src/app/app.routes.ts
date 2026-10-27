import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'characters',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'home',
    redirectTo: 'characters',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'characters',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'characters',
  },
];
