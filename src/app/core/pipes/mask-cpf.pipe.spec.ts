import { MaskCpfPipe } from './mask-cpf.pipe';

describe('MaskCpfPipe', () => {
  let pipe: MaskCpfPipe;

  beforeEach(() => {
    pipe = new MaskCpfPipe();
  });

  it('deve criar instância', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve mascarar CPF completo', () => {
    expect(pipe.transform('12345678901')).toBe('***.***.***-01');
  });

  it('deve retornar valor original se não for string', () => {
    expect(pipe.transform(null as any)).toBeNull();
    expect(pipe.transform(undefined as any)).toBeUndefined();
    expect(pipe.transform(12345678901 as any)).toBe(12345678901);
  });

  it('deve retornar string vazia se CPF for vazio', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('deve mascarar CPF com menos dígitos', () => {
    expect(pipe.transform('123')).toBe('***.***.***-23');
    expect(pipe.transform('123456')).toBe('***.***.***-56');
  });

  it('deve mascarar CPF com mais dígitos (usar apenas os últimos)', () => {
    expect(pipe.transform('123456789012')).toBe('***.***.***-12');
  });
});
