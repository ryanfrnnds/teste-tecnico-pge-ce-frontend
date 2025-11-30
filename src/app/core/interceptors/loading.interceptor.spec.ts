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

      expect(valoresCarregando).toEqual([false, true, true]);

      const req1 = httpTestingController.expectOne('/api/test1');
      req1.flush({});

      expect(valoresCarregando).toEqual([false, true, true, true]);

      const req2 = httpTestingController.expectOne('/api/test2');
      req2.flush({});

      expect(valoresCarregando).toEqual([false, true, true, true, false]);
    });

    it('deve lidar com erro nas requisições da API', () => {
      let carregandoValor: boolean | undefined;

      loadingService.carregando.subscribe(carregando => {
        carregandoValor = carregando;
      });

      httpClient.get('/api/test').subscribe({
        error: () => {} // ignorar erro para o teste
      });

      expect(carregandoValor).toBeTrue();

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Erro', { status: 500, statusText: 'Server Error' });

      expect(carregandoValor).toBeFalse();
    });
  });

  describe('Requisições fora da API', () => {
    it('não deve controlar loading para assets estáticos', () => {
      let carregandoChamado = false;

      loadingService.carregando.subscribe(() => {
        carregandoChamado = true;
      });

      httpClient.get('/assets/test.png').subscribe();

      expect(carregandoChamado).toBeFalse();

      const req = httpTestingController.expectOne('/assets/test.png');
      req.flush(new Blob());
    });

    it('não deve controlar loading para outras rotas', () => {
      let carregandoChamado = false;

      loadingService.carregando.subscribe(() => {
        carregandoChamado = true;
      });

      httpClient.get('/outra-rota').subscribe();

      expect(carregandoChamado).toBeFalse();

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
