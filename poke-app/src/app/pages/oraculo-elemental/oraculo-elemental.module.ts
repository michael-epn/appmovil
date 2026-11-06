import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OraculoElementalPageRoutingModule } from './oraculo-elemental-routing.module';
import { OraculoElementalPage } from './oraculo-elemental.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, OraculoElementalPageRoutingModule],
  declarations: [OraculoElementalPage],
})
export class OraculoElementalPageModule {}
