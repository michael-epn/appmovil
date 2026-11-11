import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { AppComponent } from './app/app.component';
import { CandidatosPage } from './app/candidatos/candidatos.page';
import { HomePage } from './app/home/home.page';
import { FIRESTORE } from './app/services/firestore.token';
import { environment } from './environments/environment';

const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(environment.firebase);

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter([
      { path: '', component: HomePage },
      { path: 'candidatos', component: CandidatosPage }
    ]),
    { provide: FIRESTORE, useValue: getFirestore(firebaseApp) }
  ]
}).catch(console.error);
