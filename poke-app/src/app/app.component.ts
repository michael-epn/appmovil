import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AnimationController } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('appContent', { read: ElementRef })
  private appContent?: ElementRef<HTMLElement>;

  constructor(private animationController: AnimationController) {}

  ngAfterViewInit(): void {
    void this.hideSplashAndRevealApp();
  }

  private async hideSplashAndRevealApp(): Promise<void> {
    try {
      await SplashScreen.hide({ fadeOutDuration: 500 });
    } catch (error) {
      console.error('No se pudo ocultar la pantalla de inicio:', error);
    }

    const element = this.appContent?.nativeElement;
    if (!element) {
      console.error('No se encontró el contenedor principal para animar la entrada.');
      return;
    }

    try {
      await this.animationController
        .create()
        .addElement(element)
        .duration(650)
        .easing('ease-out')
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'scale(0.96)', 'scale(1)')
        .play();
    } catch (error) {
      console.error('No se pudo animar la entrada de PokeApp:', error);
    }
  }
}
