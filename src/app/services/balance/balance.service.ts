import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { DatabaseService } from '../database.service';
import { Transacao } from 'src/app/models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  
  constructor(
    private databaseService: DatabaseService
  ) { }

  async getReceitasPorMes(month: string): Promise<number> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return 0;
    }

    // Define o intervalo do mês para o filtro no formato 'YYYY-MM-DD'
    const startOfMonth = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

    const receitaSql = `
      SELECT SUM(valor) AS receita_total
      FROM transacoes
      WHERE tipo = 'receita' 
      AND data_transacao >= ? 
      AND data_transacao <= ?
    `;

    try {
      // Obtém o total das receitas
      const receitaResult = await db.query(receitaSql, [startOfMonth, endOfMonth]);
      return receitaResult.values && receitaResult.values[0] ? receitaResult.values[0].receita_total : 0;
    } catch (error) {
      console.error('Erro ao obter receitas do mês: ', error);
      return 0;
    }
  }

}
