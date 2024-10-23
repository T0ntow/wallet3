import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BankService {

  private apiKey = 'pk_eyQ5ESuFQ3-4_kpNJSUKfg'; // Substitua pela sua chave da API logo.dev

  private banks = [
    { url: 'alelo.com.br', name: 'Alelo' },
    { url: 'amedigital.com', name: 'Ame digital' },
    { url: 'nubank.com.br', name: 'Nubank' },
    { url: 'bb.com.br', name: 'Banco do Brasil' },
    { url: 'willbank.com.br', name: 'Will Bank' },
    { url: 'bancopan.com.br', name: 'Banco Pan' },
    { url: 'c6bank.com.br', name: 'C6 Bank' },
    { url: 'cambio.bradesco', name: 'Bradesco' },
    { url: 'caixa.gov.br', name: 'Caixa' },
    { url: 'digio.com.br', name: 'Digio' },
    { url: 'mercadopago.com', name: 'Mercado Pago' },
    { url: 'meliuz.com.br', name: 'Meliuz' },
    { url: 'santanderbank.com', name: 'Santander Bank' },
    { url: 'paypal.com', name: 'PayPal' },
    { url: 'picpay.com', name: 'PicPay' },
    { url: 'itau.com.ar', name: 'Itaú' },
    { url: 'claropay.com', name: 'Claro Pay' },
    { url: 'xpi.com.br', name: 'XP' }
  ];

  constructor() {}

  async fetchBankLogos() {
    try {
      const bankLogos = this.banks.map((bank) => {
        const logo_url = `https://img.logo.dev/${encodeURIComponent(bank.url)}?token=${this.apiKey}`;
        console.log(logo_url);

        return { name: bank.name, logo_url };
      });
      return bankLogos;
    } catch (error) {
      console.error('Erro ao buscar logos dos bancos:', error);
      throw error;
    }
  }

  async getBankLogoByUrl(instituicao: string) {
    try {
      console.log('Instituição recebida:', instituicao); // Verifique o valor recebido
      console.log('Bancos disponíveis:', this.banks); // Verifique os bancos disponíveis
  
      // Busca o banco ignorando diferenças entre maiúsculas e minúsculas
      const bank = this.banks.find(b => b.name.toLowerCase() === instituicao.toLowerCase());
  
      if (!bank) {
        throw new Error('Banco não encontrado');
      }
  
      const logo_url = `https://img.logo.dev/${encodeURIComponent(bank.url)}?token=${this.apiKey}`;
      return logo_url ;
      
    } catch (error) {
      console.error('Erro ao buscar logo do banco:', error);
      throw error;
    }
  }
  

}
