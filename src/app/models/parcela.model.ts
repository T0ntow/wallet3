export interface Parcela {
    parcela_id: number;            // ID da parcela
    transacao_id: number;          // ID da transação associada
    valor_parcela: number;         // Valor da parcela
    data_vencimento: string;       // Data de vencimento da parcela
    status: string;                // Status da parcela ("pendente", "pago", etc.)
    descricao_parcela: string;     // Descrição da parcela (ex: "Descrição (1 de 3)")
    tipo: string;                  // Tipo de transação ("despesa" ou "receita")
    descricao: string;             // Descrição da transação (ex: "Descrição da despesa")
    categoria_id: number;          // ID da categoria associada
    cartao_id: number;             // ID do cartão associado
    is_parcelado: boolean;         // Se é parcelado (1 = sim, 0 = não)
    num_parcelas: number;          // Número total de parcelas
    data_transacao: string;        // Data da transação
  }
  