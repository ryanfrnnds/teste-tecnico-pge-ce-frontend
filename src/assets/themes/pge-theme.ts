import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * Tema customizado PGE-CE (Procuradoria Geral do Estado do Ceará)
 * Baseado na identidade visual do Governo do Estado do Ceará
 * 
 * Cores principais:
 * - Verde institucional: #00AA33
 * - Azul oceano: #0066CC
 * - Dourado: #D4AF37
 */
export const PGETheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{emerald.50}',
      100: '{emerald.100}',
      200: '{emerald.200}',
      300: '{emerald.300}',
      400: '{emerald.400}',
      500: '#00AA33', 
      600: '#009929',
      700: '#007722',
      800: '#006622',
      900: '#005519',
      950: '{emerald.950}'
    }
  }
});
