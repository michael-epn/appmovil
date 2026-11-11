import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ColiseoBiometricoPage } from './coliseo-biometrico.page';

const routes: Routes = [{ path: '', component: ColiseoBiometricoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColiseoBiometricoPageRoutingModule {}
