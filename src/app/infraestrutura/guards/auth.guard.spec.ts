import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  function executeGuard(): boolean {
    const mockRoute = {} as any;
    const mockState = {} as any;
    return TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState)) as boolean;
  }

  it('deve permitir acesso quando usuário está autenticado', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = executeGuard();

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('deve redirecionar para /login quando usuário não está autenticado', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = executeGuard();

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});


