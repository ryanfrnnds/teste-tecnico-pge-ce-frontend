import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { PGETheme } from '../assets/themes/pge-theme';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { LoadingInterceptor } from '@infraestrutura/interceptors/loading.interceptor';
import { AuthInterceptor } from '@infraestrutura/interceptors/auth.interceptor';
import { ComponentLoadingInterceptor } from '@infraestrutura/interceptors/component-loading.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ComponentLoadingInterceptor,
      multi: true
    },
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: PGETheme,
        options: {
          prefix: 'p',
          darkModeSelector: '.my-app-dark',
          cssLayer: false
        }
      },
      ripple: true,
      inputStyle: 'outlined'
    }),
    { provide: LOCALE_ID, useValue: 'pt' },
    MessageService,
    ConfirmationService
  ]
};