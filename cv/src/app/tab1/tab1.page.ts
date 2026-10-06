import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonIcon, IonLabel, IonAvatar
} from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { mailOutline, callOutline, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonIcon, IonLabel, IonAvatar, ExploreContainerComponent],
})
export class Tab1Page {
  perfil = {
    nombre: 'Michael Vargas Chávez',
    titulo: 'Estudiante de Desarrollo de Software',
    institucion: 'EPN - ESFOT',
    descripcion: 'Me caracterizo por mi capacidad de aprendizaje, comunicación, trabajo en equipo y disposición para asumir nuevos retos. Busco una oportunidad de pasantia que me permita aplicar mis conocimientos, fortalecer mis habilidades técnicas y contribuir en la atención y solución de requerimientos tecnológicos.'
  };

  contacto = [
    { icono: 'call-outline', valor: '0999101795', tipo: 'Celular' },
    { icono: 'document-text-outline', valor: '1725969537', tipo: 'Cédula' },
    { icono: 'mail-outline', valor: 'michaelvargas315@outlook.com', tipo: 'Correo' }
  ];
  constructor() {
    addIcons({ mailOutline, callOutline, documentTextOutline });
  }
}
