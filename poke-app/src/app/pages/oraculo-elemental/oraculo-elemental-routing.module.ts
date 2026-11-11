import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OraculoElementalPage } from './oraculo-elemental.page';

const routes: Routes = [{ path: '', component: OraculoElementalPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OraculoElementalPageRoutingModule {}
