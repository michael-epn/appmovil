import { Component } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, 
  IonLabel, IonAccordionGroup, IonAccordion, IonList, IonItem, IonChip, IonBadge
} from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonAccordionGroup, IonAccordion, IonList, IonItem, IonChip, IonBadge, ExploreContainerComponent]
})

export class Tab2Page {
  vistaActual: string = 'conocimientos';

  soporteTI = [
    'Atención y seguimiento de requerimientos tecnológicos',
    'Identificación y análisis de incidentes',
    'Resolución de problemas',
    'Documentación y seguimiento de casos',
    'Orientación al servicio'
  ];

  conocimientosTecnologicos = [
    { area: 'Desarrollo de Software', items: 'React, Angular, Node.js, Express, C++, Java, Python' },
    { area: 'Bases de Datos', items: 'MySQL, SQL Server, MongoDB, PostgreSQL' },
    { area: 'Análisis de Datos e IA', items: 'TensorFlow, Pandas, NumPy, Knime, NLTK' },
    { area: 'Herramientas y Gestión', items: 'Postman, JMeter, Git, Apache Bench' }
  ];

  habilidades = [
    'Comunicación efectiva', 'Trabajo en equipo', 'Capacidad de análisis',
    'Aprendizaje rápido', 'Resolución de problemas', 'Adaptabilidad', 'Proactividad',
    'Gestión del tiempo', 'Pensamiento crítico', 'Creatividad'
  ];

  cambiarVista(event: any) {
    this.vistaActual = event.detail.value;
  }
}
