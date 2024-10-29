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
    is_recorrente: boolean,
    quantidade_repetir: number | null,
    periodo: string | null,
    status: string, // Novo campo para o status (pago/pendente)
    fk_parcelas_parcela_id: number | null,
    data_transacao: string // Campo para a data da transação
): Promise<void> {
    const db = await this.databaseService.getDb();

    if (!db) {
        console.error('Database is not initialized');
        return;
    }

    // Ajustando a consulta SQL para garantir que todos os campos sejam inseridos corretamente
    const sql = `INSERT INTO transacoes 
                 (conta_id, cartao_id, categoria_id, tipo, valor, descricao, 
                  is_parcelado, num_parcelas, is_recorrente, 
                  quantidade_repetir, periodo, 
                  status, fk_parcelas_parcela_id, data_transacao) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
        await db.run(sql, [
            conta_id,
            cartao_id,
            categoria_id,
            tipo,
            valor,
            descricao,
            is_parcelado,
            num_parcelas,
            is_recorrente,
            quantidade_repetir,
            periodo,
            status,
            fk_parcelas_parcela_id,
            data_transacao // Aqui é onde você deve garantir que a data seja passada corretamente
        ]);
        console.log("Transação inserida com sucesso!");
    } catch (error) {
        console.error("Erro ao inserir transação: ", error);
    }
}


// async getAllTransactions(): Promise<Transacao[]> {
//   const db = await this.databaseService.getDb();

//   if (!db) {
//       console.error('Database is not initialized');
//       return [];
//   }

//   // Consulta para pegar todas as transações
//   const sql = 'SELECT * FROM transacoes';

//   try {
//       const result = await db.query(sql);

//       const transactions: Transacao[] = Array.isArray(result.values)
//           ? result.values.map((row) => {
//               return {
//                   transacao_id: row.transacao_id,
//                   conta_id: row.conta_id,
//                   cartao_id: row.cartao_id,
//                   categoria_id: row.categoria_id,
//                   tipo: row.tipo,
//                   valor: row.valor,
//                   descricao: row.descricao,
//                   is_parcelado: row.is_parcelado,
//                   num_parcelas: row.num_parcelas,
//                   is_recorrente: row.is_recorrente,
//                   quantidade_repetir: row.quantidade_repetir,
//                   periodo: row.periodo,
//                   fk_parcelas_parcela_id: row.fk_parcelas_parcela_id,
//                   data_transacao: row.data_transacao // caso precise
//               } as Transacao;
//           })
//           : [];

//       return transactions;
//   } catch (error) {
//       console.error('Erro ao obter transações: ', error);
//       return [];
//   }
// }

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

  async getTransactionsByMonth(month: string): Promise<Transacao[]> {
    const db = await this.databaseService.getDb();
  
    if (!db) {
      console.error('Database is not initialized');
      return [];
    }
  
    // Ajuste o formato do mês para o formato 'YYYY-MM', como '2024-10' para outubro de 2024
    const startOfMonth = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
  
    const sql = 'SELECT * FROM transacoes WHERE data_transacao BETWEEN ? AND ?';
  
    try {
      const result = await db.query(sql, [startOfMonth, endOfMonth]);
  
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
              status: row.status,
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
