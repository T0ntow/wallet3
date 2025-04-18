export interface Transacao {
    transacao_id?: number; // Torna opcional
    conta_id?: number | null; // ID da conta, será null se cartao_id estiver preenchido
    cartao_id?: number | null; // ID do cartão, será null se conta_id estiver preenchido
    categoria_id: number; // ID da categoria da transação
    tipo: 'despesa' | 'receita'; // Tipo da transação (despesa ou receita)
    valor: number; // Valor total da transação
    valor_parcela?: number | null; // Valor de cada parcela, se a transação for parcelada
    descricao?: string; // Descrição opcional da transação
    is_parcelado: number; // Se a transação é parcelada ou não
    num_parcelas?: number | null; // Número de parcelas, se for parcelada
    is_recorrente: boolean | number; // Se a transação é recorrente
    quantidade_repetir?: number; // Quantidade de vezes que a transação vai se repetir, se recorrente
    periodo?: string | null; // Período de recorrência (ex: semanal, mensal), se aplicável
    fk_parcelas_parcela_id?: number | null; // ID da parcela associada, se parcelado
    status: string; // Status da transação: "pago" ou "pendente"
    data_transacao: string; // Data da transação
    mes_fatura?: string; // Para quando a despesa for em cartão
    descricao_parcela?: string;
    parcela_id?: number  | null;
    instancia_id?: number | null;
  }
  