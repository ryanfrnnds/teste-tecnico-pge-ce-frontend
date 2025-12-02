import { MaskPhonePipe } from './mask-phone.pipe';

describe('MaskPhonePipe', () => {
  let pipe: MaskPhonePipe;

  beforeEach(() => {
    pipe = new MaskPhonePipe();
  });

  it('deve criar instância', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve mascarar telefone completo (11 dígitos)', () => {
    expect(pipe.transform('11999999999')).toBe('(11) 9****-9999');
  });

  it('deve mascarar telefone fixo/com 10 dígitos', () => {
    expect(pipe.transform('1133334444')).toBe('(11) ****-4444');
  });

  it('deve retornar valor original se telefone não tiver tamanho padrão (sem DDD ou incompleto)', () => {
    expect(pipe.transform('999999999')).toBe('999999999');
    expect(pipe.transform('123')).toBe('123');
  });

  it('deve retornar valor original se não for string', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeUndefined();
    expect(pipe.transform(12345 as any)).toBe(12345);
  });

  it('deve retornar string vazia se telefone for vazio', () => {
    expect(pipe.transform('')).toBe('');
  });
});
