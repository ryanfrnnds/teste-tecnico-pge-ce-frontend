import { MaskPhonePipe } from './mask-phone.pipe';

describe('MaskPhonePipe', () => {
  let pipe: MaskPhonePipe;

  beforeEach(() => {
    pipe = new MaskPhonePipe();
  });

  it('deve criar instância', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve mascarar telefone completo', () => {
    expect(pipe.transform('11999999999')).toBe('(11) 9****-9999');
  });

  it('deve mascarar telefone sem DDD', () => {
    expect(pipe.transform('999999999')).toBe('(99) 9****-9999');
  });

  it('deve retornar valor original se não for string', () => {
    expect(pipe.transform(null as any)).toBeNull();
    expect(pipe.transform(undefined as any)).toBeUndefined();
    expect(pipe.transform(11999999999 as any)).toBe(11999999999);
  });

  it('deve retornar string vazia se telefone for vazio', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('deve mascarar telefone com menos dígitos', () => {
    expect(pipe.transform('11999')).toBe('(11) 9****-9999');
    expect(pipe.transform('999')).toBe('(99) 9****-9999');
  });

  it('deve mascarar telefone com mais dígitos (usar apenas os últimos)', () => {
    expect(pipe.transform('119999999999')).toBe('(11) 9****-9999');
  });
});
