import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.deveControlarLoading(request)) {
      this.loadingService.incrementarRequisicao();

      return next.handle(request).pipe(
        finalize(() => {
          this.loadingService.decrementarRequisicao();
        })
      );
    }

    return next.handle(request);
  }

  private deveControlarLoading(request: HttpRequest<unknown>): boolean {
    // Controla loading apenas para requisições que começam com /api
    // Isso evita interferir com carregamento de assets, imagens, etc.
    return request.url.startsWith('/api');
  }
}
