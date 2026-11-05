import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage) // Adjust the path/class name to match your file
  },
  // Optional: Wildcard catch-all to prevent unhandled routing crashes
  {
    path: '**',
    redirectTo: 'login'
  }
];