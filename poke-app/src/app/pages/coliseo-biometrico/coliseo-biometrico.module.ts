import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ColiseoBiometricoPageRoutingModule } from './coliseo-biometrico-routing.module';
import { ColiseoBiometricoPage } from './coliseo-biometrico.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ColiseoBiometricoPageRoutingModule],
  declarations: [ColiseoBiometricoPage],
})
export class ColiseoBiometricoPageModule {}
