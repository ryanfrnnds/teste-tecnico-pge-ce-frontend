import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, AuthCredentials, AuthUser } from './auth.service';

/**
 * Suite de testes para AuthService.
 * 
 * Testa o serviço de autenticação, incluindo:
 * - Login e logout
 * - Gerenciamento de token e sessão
 * - Verificação de autenticação
 * - Restauração de sessão do localStorage
 * 
 * @module AuthService
 */
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: AuthUser = {
    id: 1,
    username: 'admin',
    name: 'Administrador'
  };

  const mockResponse = {
    token: 'fake-token',
    user: mockUser
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerSpy }]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve fazer login e salvar token e usuário', () => {
    const credentials: AuthCredentials = { username: 'admin', password: 'admin' };

    service.login(credentials).subscribe((user) => {
      expect(user).toEqual(mockUser);
      expect(service.token).toBe('fake-token');
      expect(service.usuario).toEqual(mockUser);
      expect(localStorage.getItem('teste-pge-token')).toBe('fake-token');
      expect(localStorage.getItem('teste-pge-user')).toBe(JSON.stringify(mockUser));
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);

    req.flush(mockResponse);
  });

  it('deve indicar autenticado quando existe token no storage', () => {
    localStorage.setItem('teste-pge-token', 'stored-token');
    localStorage.setItem('teste-pge-user', JSON.stringify(mockUser));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpy }]
    });

    const newService = TestBed.inject(AuthService);

    expect(newService.isAuthenticated()).toBeTrue();
    expect(newService.usuario).toEqual(mockUser);
  });

  it('deve fazer logout limpando storage e redirecionando para /login', () => {
    localStorage.setItem('teste-pge-token', 'token');
    localStorage.setItem('teste-pge-user', JSON.stringify(mockUser));

    service.logout();

    expect(localStorage.getItem('teste-pge-token')).toBeNull();
    expect(localStorage.getItem('teste-pge-user')).toBeNull();
    expect(service.usuario).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});


