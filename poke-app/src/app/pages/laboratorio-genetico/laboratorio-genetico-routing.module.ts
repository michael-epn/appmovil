import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LaboratorioGeneticoPage } from './laboratorio-genetico.page';

const routes: Routes = [{ path: '', component: LaboratorioGeneticoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaboratorioGeneticoPageRoutingModule {}
