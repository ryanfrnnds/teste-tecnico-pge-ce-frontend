import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ComponentLoadingService } from '../services/component-loading.service';

/**
 * Interceptor para controle de loading específico de componentes
 * Permite que cada componente tenha seu próprio estado de loading
 * através do ComponentLoadingService
 */
@Injectable()
export class ComponentLoadingInterceptor implements HttpInterceptor {

  constructor(private componentLoadingService: ComponentLoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const componentId = request.headers.get('X-Component-Loading');

    if (!componentId) {
      return next.handle(request);
    }

    const loadingSubject = this.componentLoadingService.getComponentLoading(componentId);

    if (!loadingSubject) {
      console.warn(`ComponentLoadingInterceptor: Componente "${componentId}" não registrado no ComponentLoadingService`);
      return next.handle(request);
    }

    loadingSubject.next(true);

    return next.handle(request).pipe(
      finalize(() => {
        loadingSubject.next(false);
      })
    );
  }
}
