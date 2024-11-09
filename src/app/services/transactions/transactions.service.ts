import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DatabaseService } from '../database.service';
import { Transacao } from 'src/app/models/transaction.model';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private db!: SQLiteDBConnection;

  private transactionUpdatedSource = new BehaviorSubject<void>(undefined);
  transactionUpdated$ = this.transactionUpdatedSource.asObservable();

  notifyTransactionUpdate() {
    this.transactionUpdatedSource.next();
  }

  constructor(private databaseService: DatabaseService) { }

  // Inserir nova transação
  async addTransaction(
    conta_id: number | null,
    cartao_id: number | null,
    categoria_id: number,
    tipo: string,
    valor: number,
    descricao: string,
    is_parcelado: boolean,
    num_parcelas: number | null,
    valor_parcela: number | null,
    is_recorrente: boolean,
    quantidade_repetir: number | null,
    periodo: string | null,
    status: string,
    fk_parcelas_parcela_id: number | null,
    data_transacao: string,
    mes_fatura: string | null
  ): Promise<void> {
    const db = await this.databaseService.getDb();
  
    if (!db) {
      console.error('Database is not initialized');
      return;
    }
  
    // Inserir transação na tabela 'transacoes'
    const sql = `INSERT INTO transacoes 
                 (conta_id, cartao_id, categoria_id, tipo, valor, descricao, 
                  is_parcelado, num_parcelas, valor_parcela, is_recorrente, 
                  quantidade_repetir, periodo, status, 
                  fk_parcelas_parcela_id, data_transacao, mes_fatura) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
    try {
      // Executa a inserção da transação
      const result = await db.run(sql, [
        conta_id,
        cartao_id,
        categoria_id,
        tipo,
        valor,
        descricao,
        is_parcelado,
        num_parcelas,
        valor_parcela,
        is_recorrente,
        quantidade_repetir,
        periodo,
        status,
        fk_parcelas_parcela_id,
        data_transacao,
        mes_fatura
      ]);
      console.log("Transação inserida com sucesso!");
  
      // Se a transação for parcelada, cria as parcelas associadas
      if (is_parcelado && num_parcelas && valor_parcela && mes_fatura) {
        // Obter o ID da última inserção (se necessário para criar parcelas futuras)
        const idResult = await db.query('SELECT last_insert_rowid() AS id');
        const transacao_id = idResult.values![0].id;
  
        // Adicionar as parcelas relacionadas à transação
        for (let i = 1; i <= num_parcelas - 1; i++) {  // Começa em 1 para iniciar no próximo mês
          const vencimento = this.calculateDueDate(mes_fatura, i); // Passa o índice da parcela
  
          const insertParcelaSql = `
            INSERT INTO parcelasTable 
            (transacao_id, valor, data_vencimento, status) 
            VALUES (?, ?, ?, ?)
          `;
  
          await db.run(insertParcelaSql, [
            transacao_id,
            valor_parcela,
            vencimento,
            'pendente'  // Status 'pendente' para a parcela
          ]);
        }
        console.log(`${num_parcelas} parcelas inseridas com sucesso!`);
      }
    } catch (error) {
      console.error("Erro ao inserir transação ou parcelas: ", error);
    }
  }
  
  // Função auxiliar para calcular a data de vencimento das parcelas
  calculateDueDate(mes_fatura: string, parcelaIndex: number): string {
    // Converter a data de transação para um objeto de data usando Moment.js ou outra biblioteca de manipulação de datas
    const initialDate = moment(mes_fatura, 'YYYY-MM-DD');
    const dueDate = initialDate.add(parcelaIndex, 'months'); // Incrementa os meses de acordo com o índice da parcela
    return dueDate.format('YYYY-MM-DD'); // Formato da data de vencimento
  }
  

  // Buscar uma transação por ID
  async getTransactionById(transacao_id: number): Promise<Transacao | null> {
    const sql = `SELECT * FROM transacoes WHERE transacao_id = ?`;

    try {
      const res = await this.db!.query(sql, [transacao_id]);
      if (res.values && res.values.length > 0) {
        return res.values[0] as Transacao;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar transação: ", error);
      return null;
    }
  }

  async getAllTransactions(): Promise<Transacao[]> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return [];
    }

    // Consulta para pegar todas as transações
    const sql = 'SELECT * FROM transacoes WHERE tipo = "despesa"';

    try {
      const result = await db.query(sql);

      const transactions: Transacao[] = Array.isArray(result.values)
        ? result.values.map((row) => {
          return {
            transacao_id: row.transacao_id,
            conta_id: row.conta_id,
            cartao_id: row.cartao_id,
            categoria_id: row.categoria_id,
            tipo: row.tipo,
            valor: row.valor,
            descricao: row.descricao,
            is_parcelado: row.is_parcelado,
            num_parcelas: row.num_parcelas,
            is_recorrente: row.is_recorrente,
            quantidade_repetir: row.quantidade_repetir,
            periodo: row.periodo,
            fk_parcelas_parcela_id: row.fk_parcelas_parcela_id,
            data_transacao: row.data_transacao // caso precise
          } as Transacao;
        })
        : [];

      return transactions;
    } catch (error) {
      console.error('Erro ao obter transações: ', error);
      return [];
    }
  }


  // Exemplo de como garantir que o retorno seja um array
  async getParcelasByMonth(month: string): Promise<any[]> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return [];
    }

    const startOfMonth = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

    try {
      // Consulta SQL para buscar parcelas no intervalo fornecido
      const query = `
        SELECT * FROM parcelasTable
        WHERE data_vencimento BETWEEN ? AND ?
      `;

      const result = await db.query(query, [startOfMonth, endOfMonth]);

      // Verificar se result.values existe
      if (result && result.values) {
        const installments = Array.isArray(result.values) ? result.values : Object.values(result.values);

        if (installments.length > 0) {
          return installments;
        } else {
          console.log('Nenhuma parcela encontrada no intervalo fornecido');
          return [];
        }
      } else {
        console.log('Nenhuma parcela encontrada no intervalo fornecido');
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar parcelas de despesas recorrentes:', error);
      return [];
    }
  }

  async getDespesasCartaoByMonth(month: string): Promise<Transacao[]> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return [];
    }

    // Define o intervalo do mês para o filtro no formato 'YYYY-MM-DD'
    const startOfMonth = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

    const sql = `
      SELECT * FROM transacoes
      WHERE tipo = 'despesa' 
      AND cartao_id IS NOT NULL 
      AND mes_fatura >= ? 
      AND mes_fatura <= ?
    `;

    try {
      const result = await db.query(sql, [startOfMonth, endOfMonth]);
      return Array.isArray(result.values) ? result.values.map(this.mapRowToTransacao) : [];
    } catch (error) {
      console.error('Erro ao obter despesas de cartão: ', error);
      return [];
    }
  }

  async getDespesasContaByMonth(month: string): Promise<Transacao[]> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return [];
    }

    // Define o intervalo do mês para o filtro no formato 'YYYY-MM-DD'
    const startOfMonth = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

    const sql = `
    SELECT * FROM transacoes
    WHERE tipo = 'despesa' AND cartao_id IS NULL AND data_transacao BETWEEN ? AND ?
  `;

    try {
      const result = await db.query(sql, [startOfMonth, endOfMonth]);
      return Array.isArray(result.values) ? result.values.map(this.mapRowToTransacao) : [];
    } catch (error) {
      console.error('Erro ao obter despesas de conta: ', error);
      return [];
    }
  }

  private mapRowToTransacao(row: any): Transacao {
    return {
      transacao_id: row.transacao_id,
      conta_id: row.conta_id,
      cartao_id: row.cartao_id,
      categoria_id: row.categoria_id,
      tipo: row.tipo,
      valor: row.valor,
      descricao: row.descricao,
      is_parcelado: row.is_parcelado,
      num_parcelas: row.num_parcelas,
      valor_parcela: row.valor_parcela,
      is_recorrente: row.is_recorrente,
      quantidade_repetir: row.quantidade_repetir,
      periodo: row.periodo,
      status: row.status,
      fk_parcelas_parcela_id: row.fk_parcelas_parcela_id,
      data_transacao: row.data_transacao,
      mes_fatura: row.mes_fatura // Inclui o `mes_fatura` caso exista
    } as Transacao;
  }


  // Atualizar uma transação
  async updateTransaction(transacao_id: number, conta_id: number, cartao_id: number, categoria_id: number, tipo: string, valor: number, descricao: string, is_parcelado: boolean, num_parcelas: number, is_recorrente: boolean, quantidade_repetir: number, periodo: string, fk_parcelas_parcela_id: number) {
    const sql = `UPDATE transacoes SET conta_id = ?, cartao_id = ?, categoria_id = ?, tipo = ?, valor = ?, descricao = ?, is_parcelado = ?, num_parcelas = ?, is_recorrente = ?, quantidade_repetir = ?, periodo = ?, fk_parcelas_parcela_id = ? WHERE transacao_id = ?`;

    try {
      await this.db!.run(sql, [conta_id, cartao_id, categoria_id, tipo, valor, descricao, is_parcelado, num_parcelas, is_recorrente, quantidade_repetir, periodo, fk_parcelas_parcela_id, transacao_id]);
      console.log("Transação atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar transação: ", error);
    }
  }

  // Deletar uma transação
  async deleteTransaction(transacao_id: number) {
    const sql = `DELETE FROM transacoes WHERE transacao_id = ?`;

    try {
      await this.db!.run(sql, [transacao_id]);
      console.log("Transação deletada com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar transação: ", error);
    }
  }
}
