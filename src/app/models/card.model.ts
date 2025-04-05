// export interface Card {
//     cartao_id: number;      // ID da conta
//     nome: string;          // Nome da conta
//     tipo: string;          // Tipo da conta (ex: corrente, poupança, etc.)
//     instituicao: string;   // Instituição financeira da conta
//     limite: number;         // Saldo da conta, se for numérico
//     logo_url: string;
//     dia_fechamento: number;
//   }

  export interface Card {
    cartao_id: number;      // ID do cartão
    nome: string;           // Nome do cartão
    instituicao: string;    // Banco ou instituição emissora
    limiteTotal: number;    // Limite total disponível no cartão
    limiteAtual: number;    // Limite disponível após compras
    logo_url: string;       // URL do logo do cartão
    dia_fechamento: number; // Dia de fechamento da fatura
  }
  