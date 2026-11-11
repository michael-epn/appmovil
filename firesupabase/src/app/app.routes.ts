import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'rooms',
        loadComponent: () => import('./rooms/rooms.page').then((m) => m.RoomsPage),
      },
      {
        path: 'community',
        loadComponent: () => import('./community/community.page').then((m) => m.CommunityPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'rooms',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'rooms/:roomId',
    loadComponent: () => import('./chat-room/chat-room.page').then((m) => m.ChatRoomPage),
  },
  {
    path: 'rooms',
    redirectTo: 'tabs/rooms',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    redirectTo: 'tabs/profile',
    pathMatch: 'full',
  },
  {
    path: 'community',
    redirectTo: 'tabs/community',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
