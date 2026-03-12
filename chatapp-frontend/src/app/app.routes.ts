import { Routes } from '@angular/router';
import { authGuard } from './Core/guards/auth.guard'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./Feature/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./Feature/auth/register/register').then(m => m.Register)
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./Feature/chat/chat').then(m => m.Chat)
  },
  { path: '**', redirectTo: 'chat' }
];