import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LaboratorioGeneticoPageRoutingModule } from './laboratorio-genetico-routing.module';
import { LaboratorioGeneticoPage } from './laboratorio-genetico.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LaboratorioGeneticoPageRoutingModule],
  declarations: [LaboratorioGeneticoPage],
})
export class LaboratorioGeneticoPageModule {}
