import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService, AuthCredentials, AuthUser } from '@infraestrutura/services/auth.service';
import { MessageService } from 'primeng/api';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockUser: AuthUser = {
    id: 1,
    username: 'admin',
    name: 'Admin'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['login', 'isAuthenticated']
    );
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    authServiceSpy.isAuthenticated.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('não deve submeter se formulário for inválido', () => {
    component.loginForm.setValue({ username: '', password: '' });

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('deve chamar AuthService.login e navegar para /clientes em caso de sucesso', () => {
    const credentials: AuthCredentials = { username: 'admin', password: 'admin' };
    component.loginForm.setValue(credentials);

    authServiceSpy.login.and.returnValue(of(mockUser));

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith(credentials);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Bem-vindo'
      })
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clientes']);
  });

  it('deve exibir mensagem de erro quando login falhar', () => {
    const credentials: AuthCredentials = { username: 'admin', password: 'wrong' };
    component.loginForm.setValue(credentials);

    authServiceSpy.login.and.returnValue(
      throwError(() => ({ error: { message: 'Credenciais inválidas.' } }))
    );

    component.onSubmit();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Erro',
        detail: 'Credenciais inválidas.'
      })
    );
  });

  it('deve redirecionar imediatamente para /clientes se já estiver autenticado no construtor', async () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const localFixture = await TestBed.createComponent(LoginComponent);
    localFixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clientes']);
  });
});


