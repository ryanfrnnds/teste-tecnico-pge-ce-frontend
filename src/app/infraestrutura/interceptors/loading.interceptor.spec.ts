import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { LoadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('LoadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoadingService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoadingInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Requisições da API (/api)', () => {
    it('deve controlar loading para requisições da API', () => {
      let carregandoValor: boolean | undefined;

      loadingService.carregando.subscribe(carregando => {
        carregandoValor = carregando;
      });

      httpClient.get('/api/test').subscribe();

      expect(carregandoValor).toBeTrue();

      const req = httpTestingController.expectOne('/api/test');
      req.flush({});

      expect(carregandoValor).toBeFalse();
    });

    it('deve empilhar múltiplas requisições da API', () => {
      const valoresCarregando: boolean[] = [];

      loadingService.carregando.subscribe(carregando => {
        valoresCarregando.push(carregando);
      });

      httpClient.get('/api/test1').subscribe();
      httpClient.get('/api/test2').subscribe();

      // [false (inicial), true (primeira req)]. Segunda req não emite novo true.
      expect(valoresCarregando).toEqual([false, true]);

      const req1 = httpTestingController.expectOne('/api/test1');
      req1.flush({});

      // Continua true pois tem 1 req pendente
      expect(valoresCarregando).toEqual([false, true]);

      const req2 = httpTestingController.expectOne('/api/test2');
      req2.flush({});

      // Volta a false
      expect(valoresCarregando).toEqual([false, true, false]);
    });

    it('deve lidar com erro nas requisições da API', () => {
      let carregandoValor: boolean | undefined;

      loadingService.carregando.subscribe(carregando => {
        carregandoValor = carregando;
      });

      httpClient.get('/api/test').subscribe({
        error: () => {} 
      });

      expect(carregandoValor).toBeTrue();

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Erro', { status: 500, statusText: 'Server Error' });

      expect(carregandoValor).toBeFalse();
    });
  });

  describe('Requisições fora da API', () => {
    it('não deve controlar loading para assets estáticos', () => {
      let carregandoValor = false;

      loadingService.carregando.subscribe(val => {
        carregandoValor = val;
      });

      httpClient.get('/assets/test.png').subscribe();

      // Deve permanecer false (valor inicial) e não ter mudado para true
      expect(carregandoValor).toBeFalse();

      const req = httpTestingController.expectOne('/assets/test.png');
      // Não precisamos de corpo específico para este teste; evitar Blob para não forçar conversão JSON
      req.flush({});
    });

    it('não deve controlar loading para outras rotas', () => {
      let carregandoValor = false;

      loadingService.carregando.subscribe(val => {
        carregandoValor = val;
      });

      httpClient.get('/outra-rota').subscribe();

      expect(carregandoValor).toBeFalse();

      const req = httpTestingController.expectOne('/outra-rota');
      req.flush({});
    });
  });

  describe('Controle de requisições ativas', () => {
    it('deve manter contador correto de requisições ativas', () => {
      const valoresRequisicoes: number[] = [];

      loadingService.requisicoesAtivas.subscribe(requisicoes => {
        valoresRequisicoes.push(requisicoes);
      });

      httpClient.get('/api/test1').subscribe();
      httpClient.get('/api/test2').subscribe();

      expect(valoresRequisicoes).toEqual([0, 1, 2]);

      const req1 = httpTestingController.expectOne('/api/test1');
      req1.flush({});

      expect(valoresRequisicoes).toEqual([0, 1, 2, 1]);

      const req2 = httpTestingController.expectOne('/api/test2');
      req2.flush({});

      expect(valoresRequisicoes).toEqual([0, 1, 2, 1, 0]);
    });
  });
});
