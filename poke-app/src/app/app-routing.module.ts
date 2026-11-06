import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
  { path: 'pokemon-list', redirectTo: 'tabs/codice', pathMatch: 'full' },
  { path: 'tabs', loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule) },
  {
    path: 'pokemon-detail/:id',
    loadChildren: () => import('./pages/pokemon-detail/pokemon-detail.module').then( m => m.PokemonDetailPageModule)
  },
  { path: '**', redirectTo: 'tabs/codice' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}