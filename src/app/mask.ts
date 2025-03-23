import { maskitoNumberOptionsGenerator } from '@maskito/kit';

export const maskitoPrice = maskitoNumberOptionsGenerator({
  decimalSeparator: ',',  // Separador decimal: vírgula
  thousandSeparator: '.', // Separador de milhar: ponto
  precision: 2,           // Precisão: 2 casas decimais
  prefix: 'R$ ',         // Prefixo: Símbolo de moeda antes do valor
  min: 0,        
});
