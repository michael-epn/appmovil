import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonProgressBar, IonLabel, IonItem, IonIcon
} from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { schoolOutline, languageOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonProgressBar, IonLabel, IonItem, IonIcon, ExploreContainerComponent],
})

export class Tab3Page {
  educacion = {
    institucion: 'EPN - ESFOT',
    carrera: 'Desarrollo de Software',
    nivel: 'Tercer Nivel de Educación Superior',
    periodo: '2024 - Presente'
  };

  idioma = {
    nombre: 'Inglés',
    nivelTexto: 'Nivel intermedio',
    nivelValor: 0.5
  };

  constructor() {
    addIcons({ schoolOutline, languageOutline });
  }
}
