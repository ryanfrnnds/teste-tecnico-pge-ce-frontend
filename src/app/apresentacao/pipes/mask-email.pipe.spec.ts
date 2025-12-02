import { MaskEmailPipe } from './mask-email.pipe';

describe('MaskEmailPipe', () => {
  let pipe: MaskEmailPipe;

  beforeEach(() => {
    pipe = new MaskEmailPipe();
  });

  it('deve criar instância', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve mascarar email simples', () => {
    expect(pipe.transform('usuario@dominio.com')).toBe('u****@dominio.com');
  });

  it('deve mascarar email com ponto no nome', () => {
    expect(pipe.transform('nome.sobrenome@dominio.com')).toBe('n****.s****@dominio.com');
  });

  it('deve mascarar email curto', () => {
    expect(pipe.transform('a@b.com')).toBe('a****@b.com');
  });

  it('deve retornar valor original se não for string', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeUndefined();
    expect(pipe.transform(123 as any)).toBe(123);
  });

  it('deve retornar string vazia se email for vazio', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('deve retornar valor original se formato inválido (sem @)', () => {
    expect(pipe.transform('emailinvalido')).toBe('emailinvalido');
  });
});
