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
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeUndefined();
    expect(pipe.transform(12345678901 as any)).toBe(12345678901);
  });

  it('deve retornar string vazia se CPF for vazio', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('deve retornar valor original se CPF tiver tamanho inválido', () => {
    expect(pipe.transform('123')).toBe('123');
    expect(pipe.transform('123456')).toBe('123456');
    expect(pipe.transform('123456789012')).toBe('123456789012'); // 12 digitos
  });
});
