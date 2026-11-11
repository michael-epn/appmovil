import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { HomePage } from './app/home/home.page';

bootstrapApplication(AppComponent, {
  providers: [provideIonicAngular(), provideRouter([{ path: '', component: HomePage }])]
}).catch(console.error);
