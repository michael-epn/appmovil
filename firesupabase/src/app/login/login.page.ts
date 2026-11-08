import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar } from '@ionic/angular';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  imports: [ReactiveFormsModule, IonButton, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar],
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  isRegistering = false;
  isSubmitting = false;
  errorMessage = '';

  async submit(): Promise<void> {
    this.errorMessage = '';
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { email, password } = this.form.getRawValue();
    try {
      if (this.isRegistering) {
        await this.authService.register(email, password);
      } else {
        await this.authService.signIn(email, password);
      }
      await this.router.navigateByUrl('/tabs/profile');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'No se pudo completar la autenticación.';
    } finally {
      this.isSubmitting = false;
    }
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
  }
}
