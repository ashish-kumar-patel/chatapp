import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './Core/interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  // providers: [
  //   provideBrowserGlobalErrorListeners(),
  //   provideRouter(routes), provideClientHydration(withEventReplay())
  // ]


  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
