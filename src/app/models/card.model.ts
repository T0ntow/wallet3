export interface Card {
    cartao_id: number;      // ID da conta
    nome: string;          // Nome da conta
    tipo: string;          // Tipo da conta (ex: corrente, poupança, etc.)
    instituicao: string;   // Instituição financeira da conta
    limite: number;         // Saldo da conta, se for numérico
    logo_url: string;
    dia_fechamento: string;
  }
  