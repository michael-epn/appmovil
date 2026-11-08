import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly theme = inject(ThemeService);

  constructor() {
    void this.theme.initialize().catch((error: unknown) => {
      console.error('No se pudo restaurar el tema guardado.', error);
    });
  }
}
