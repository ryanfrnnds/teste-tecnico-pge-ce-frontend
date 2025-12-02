import { MaskEmailPipe } from './mask-email.pipe';

describe('MaskEmailPipe', () => {
  let pipe: MaskEmailPipe;

  beforeEach(() => {
    pipe = new MaskEmailPipe();
  });

  it('deve criar instância', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve mascarar email completo', () => {
    expect(pipe.transform('usuario@dominio.com')).toBe('u*****.c********@dominio.com');
  });

  it('deve mascarar email com nome curto', () => {
    expect(pipe.transform('a@b.com')).toBe('a*****.b****@b.com');
  });

  it('deve mascarar email com domínio longo', () => {
    expect(pipe.transform('teste@empresa.com.br')).toBe('t****.e******@empresa.com.br');
  });

  it('deve retornar valor original se não for string', () => {
    expect(pipe.transform(null as any)).toBeNull();
    expect(pipe.transform(undefined as any)).toBeUndefined();
    expect(pipe.transform(123 as any) as any).toBe(123);
  });

  it('deve retornar string vazia se email for vazio', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('deve retornar email sem @ se formato inválido', () => {
    expect(pipe.transform('emailinvalido')).toBe('emailinvalido');
  });

  it('deve mascarar corretamente email com subdomínio', () => {
    expect(pipe.transform('user@sub.dominio.com')).toBe('u***.s**.d********@sub.dominio.com');
  });
});
