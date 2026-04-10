import {
  ApplicationConfig,
  importProvidersFrom,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { IonicModule } from '@ionic/angular';
import { routes } from './app.routes';
import { clientTypeInterceptor } from './core/interceptors/client-type.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideIonicAngular({}),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, clientTypeInterceptor])),
    importProvidersFrom(IonicModule.forRoot()),
  ],
};
