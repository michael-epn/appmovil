import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'codice',
        loadChildren: () =>
          import('../pokemon-list/pokemon-list.module').then((module) => module.PokemonListPageModule),
      },
      {
        path: 'coliseo',
        loadChildren: () =>
          import('../coliseo-biometrico/coliseo-biometrico.module').then(
            (module) => module.ColiseoBiometricoPageModule
          ),
      },
      {
        path: 'oraculo',
        loadChildren: () =>
          import('../oraculo-elemental/oraculo-elemental.module').then(
            (module) => module.OraculoElementalPageModule
          ),
      },
      {
        path: 'laboratorio',
        loadChildren: () =>
          import('../laboratorio-genetico/laboratorio-genetico.module').then(
            (module) => module.LaboratorioGeneticoPageModule
          ),
      },
      { path: '', redirectTo: 'codice', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
