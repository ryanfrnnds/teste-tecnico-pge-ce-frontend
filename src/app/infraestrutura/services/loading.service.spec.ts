import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

/**
 * Suite de testes para LoadingService.
 * 
 * Testa o gerenciamento de estado de loading global da aplicação, incluindo:
 * - Controle de requisições HTTP ativas
 * - Emissão de estado de carregamento (true/false)
 * - Comportamento com múltiplas requisições simultâneas
 * 
 * @module LoadingService
 */
describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('Estado inicial', () => {
    it('deve iniciar com 0 requisições ativas e carregando false', (done) => {
      service.requisicoesAtivas.subscribe(requisicoes => {
        expect(requisicoes).toBe(0);
      });

      service.carregando.subscribe(carregando => {
        expect(carregando).toBeFalse();
        done();
      });
    });
  });

  describe('incrementarRequisicao', () => {
    it('deve incrementar contador de requisições', (done) => {
      service.requisicoesAtivas.subscribe(requisicoes => {
        if (requisicoes === 1) {
          expect(requisicoes).toBe(1);
          done();
        }
      });

      service.incrementarRequisicao();
    });

    it('deve definir carregando como true na primeira requisição', (done) => {
      let carregandoChamadas = 0;

      service.carregando.subscribe(carregando => {
        carregandoChamadas++;
        if (carregandoChamadas === 2) {
          expect(carregando).toBeTrue();
          done();
        }
      });

      service.incrementarRequisicao();
    });

    it('deve manter carregando true em múltiplas requisições', (done) => {
      const valores: boolean[] = [];
      
      service.carregando.subscribe(carregando => {
        valores.push(carregando);
        
        if (valores.length === 2) {
          expect(valores).toEqual([false, true]);
          expect(service['requisicoesAtivas$'].value).toBeGreaterThan(0);
          done();
        }
      });

      service.incrementarRequisicao();
      service.incrementarRequisicao();
    });
  });

  describe('decrementarRequisicao', () => {
    beforeEach(() => {
      service.incrementarRequisicao();
      service.incrementarRequisicao();
    });

    it('deve decrementar contador de requisições', (done) => {
      service.requisicoesAtivas.subscribe(requisicoes => {
        if (requisicoes === 1) {
          expect(requisicoes).toBe(1);
          done();
        }
      });

      service.decrementarRequisicao();
    });

    it('deve definir carregando como false quando chegar a 0 requisições', (done) => {
      let carregandoChamadas = 0;

      service.carregando.subscribe(carregando => {
        carregandoChamadas++;
        if (carregandoChamadas === 2) {
          expect(carregando).toBeFalse();
          done();
        }
      });

      service.decrementarRequisicao();
      service.decrementarRequisicao();
    });

    it('deve manter carregando true enquanto houver requisições ativas', (done) => {
      service.carregando.subscribe(carregando => {
        expect(carregando).toBeTrue();
        done();
      });
    });

    it('não deve permitir contador negativo', (done) => {
      service.decrementarRequisicao();
      service.decrementarRequisicao();
      service.decrementarRequisicao();

      service.requisicoesAtivas.subscribe(requisicoes => {
        expect(requisicoes).toBe(0);
        done();
      });
    });
  });

  describe('Cenários complexos', () => {
    it('deve lidar com sequência de incrementos e decrementos', (done) => {
      const valoresEsperados = [0, 1, 2, 1, 0];
      let index = 0;

      service.requisicoesAtivas.subscribe(requisicoes => {
        expect(requisicoes).toBe(valoresEsperados[index]);
        index++;

        if (index === valoresEsperados.length) {
          done();
        }
      });

      service.incrementarRequisicao();
      service.incrementarRequisicao();
      service.decrementarRequisicao();
      service.decrementarRequisicao();
    });

    it('deve gerenciar estado de carregando corretamente', (done) => {
      const valoresEsperados = [false, true, false];
      let index = 0;

      service.carregando.subscribe(carregando => {
        expect(carregando).toBe(valoresEsperados[index]);
        index++;

        if (index === valoresEsperados.length) {
          done();
        }
      });

      service.incrementarRequisicao();
      service.incrementarRequisicao();
      service.decrementarRequisicao();
      service.decrementarRequisicao();
    });
  });
});
