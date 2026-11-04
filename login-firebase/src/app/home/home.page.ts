import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/angular';
import { AuthService } from '../services/auth';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  ]
})
export class HomePage {

  user$;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.user$ = this.auth.user$;
  }

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/login', {
      replaceUrl: true
    });
  }
}