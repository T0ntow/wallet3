export interface Transacao {
    transacao_id?: number;  // ID da transação, opcional para casos de nova inserção
    conta_id?: number | null;  // ID da conta, será null se cartao_id estiver preenchido
    cartao_id?: number | null;  // ID do cartão, será null se conta_id estiver preenchido
    categoria_id: number;  // ID da categoria da transação
    tipo: 'despesa' | 'receita';  // Tipo da transação (despesa ou receita)
    valor: number;  // Valor da transação
    descricao?: string;  // Descrição opcional da transação
    is_parcelado: boolean;  // Se a transação é parcelada ou não
    num_parcelas?: number | null;  // Número de parcelas, se for parcelada
    is_recorrente: boolean;  // Se a transação é recorrente
    quantidade_repetir?: number | null;  // Quantidade de vezes que a transação vai se repetir, se recorrente
    periodo?: string | null;  // Período de recorrência (ex: semanal, mensal), se aplicável
    fk_parcelas_parcela_id?: number | null;  // ID da parcela associada, se parcelado
    status: string
}
