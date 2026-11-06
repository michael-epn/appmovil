import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonInput,
  IonButton,
  IonText
} from '@ionic/angular';
import { AuthService } from '../services/auth';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonInput,
    IonButton,
    IonText
  ]
})
export class LoginPage {

  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async login() {
    this.loading = true;
    this.error = '';

    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigateByUrl('/home', {
        replaceUrl: true
      });
    } catch (err: any) {
      this.error = 'No se pudo iniciar sesión. Verifique sus datos.';
    } finally {
      this.loading = false;
    }
  }

  async register() {
    this.loading = true;
    this.error = '';

    try {
      await this.auth.register(this.email, this.password);
      await this.router.navigateByUrl('/home', {
        replaceUrl: true
      });
    } catch (err: any) {
      this.error = 'No se pudo registrar. Verifique el correo y la contraseña.';
    } finally {
      this.loading = false;
    }
  }
}