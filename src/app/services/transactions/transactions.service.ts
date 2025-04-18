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

  async addTransaction(
    conta_id: number | null,
    cartao_id: number | null,
    categoria_id: number,
    tipo: string,
    valor: number | null,
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
      console.error("Database is not initialized");
      return;
    }

    const sql = `
      INSERT INTO transacoes 
      (conta_id, cartao_id, categoria_id, tipo, valor, descricao, 
      is_parcelado, num_parcelas, valor_parcela, is_recorrente, 
      quantidade_repetir, periodo, status, 
      fk_parcelas_parcela_id, data_transacao, mes_fatura) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      // Inserir transação principal
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
        mes_fatura,
      ]);

      console.log("Transação inserida com sucesso!");

      // Obter o ID da última transação inserida
      const idResult = await db.query("SELECT last_insert_rowid() AS id");
      const transacao_id = idResult.values![0].id;

      // Ajustar saldo da conta ou limite do cartão
      if (cartao_id !== null && valor !== null) {
        await db.run(
          `UPDATE cartaoTable SET limite_atual = limite_atual - ? WHERE cartao_id = ?`,
          [valor, cartao_id]
        );
        console.log("Limite do cartão atualizado!");
      } else if (conta_id !== null && valor !== null) {
        await db.run(
          `UPDATE accountTable SET saldo = saldo - ? WHERE conta_id = ?`,
          [valor, conta_id]
        );
        console.log("Saldo da conta atualizado!");
      }


      // Lógica para gerar parcelas se a transação for parcelada
      if (is_parcelado && num_parcelas && valor_parcela && mes_fatura) {
        for (let i = 0; i < num_parcelas; i++) {
          const vencimento = this.calculateDueDate(mes_fatura, i);
          const descricaoParcela = `${descricao} (${i + 1} de ${num_parcelas})`;

          const insertParcelaSql = `
            INSERT INTO parcelasTable 
            (transacao_id, valor_parcela, data_vencimento, status, descricao_parcela) 
            VALUES (?, ?, ?, ?, ?)
          `;

          await db.run(insertParcelaSql, [
            transacao_id,
            valor_parcela,
            vencimento,
            status,
            descricaoParcela,
          ]);
        }
        console.log(`${num_parcelas} parcelas inseridas com sucesso!`);
      }

      // Lógica para gerar instâncias recorrentes se for uma transação recorrente
      if (is_recorrente && quantidade_repetir && periodo) {
        for (let i = 1; i < quantidade_repetir; i++) {
          // Calcular a data da próxima instância
          const dataProximaInstancia = this.calculateNextDate(data_transacao, periodo, i);

          const insertInstanciaSql = `
            INSERT INTO instancias_recorrentes 
            (despesa_mae_id, data_transacao, status) 
            VALUES (?, ?, ?)
          `;

          await db.run(insertInstanciaSql, [
            transacao_id,
            dataProximaInstancia,
            'pendente',
          ]);
        }
        console.log(`Foram geradas ${quantidade_repetir} instâncias recorrentes com sucesso!`);
      }
    } catch (error) {
      console.error("Erro ao inserir transação ou instâncias: ", error);
    }
  }

  // async gerarInstanciasRecorrentes(
  //   transacao_id: number,
  //   quantidade_repetir: number,
  //   periodo: string,
  //   data_transacao: string
  // ): Promise<void> {
  //   const db = await this.databaseService.getDb();

  //   if (!db) {
  //     console.error("Database is not initialized");
  //     return;
  //   }

  //   try {
  //     for (let i = 1; i <= quantidade_repetir; i++) {
  //       // Calcula a data da próxima instância com base no período
  //       const novaDataTransacao = this.calculateNextDate(data_transacao, periodo, i);

  //       const sql = `
  //         INSERT INTO instancias_recorrentes 
  //         (despesa_mae_id, data_transacao, status) 
  //         VALUES (?, ?, ?)`;

  //       await db.run(sql, [transacao_id, novaDataTransacao, 'pendente']);
  //     }

  //     console.log(`Instâncias recorrentes geradas: ${quantidade_repetir}`);
  //   } catch (error) {
  //     console.error("Erro ao gerar instâncias recorrentes:", error);
  //   }
  // }

  async deleteAllInstances(despesaMaeId: number): Promise<void> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error("Database is not initialized");
      return;
    }

    try {
      const sql = `DELETE FROM instancias_recorrentes WHERE despesa_mae_id = ?`;
      await db.run(sql, [despesaMaeId]);

      console.log('Todas as instâncias da despesa recorrente foram removidas!');
    } catch (error) {
      console.error('Erro ao excluir as instâncias:', error);
    }
  }

  calculateNextDate(startDate: string, periodo: string, incremento: number): string {
    const date = new Date(startDate);

    switch (periodo) {
      case "mensal":
        date.setMonth(date.getMonth() + incremento);
        break;
      case "semanal":
        date.setDate(date.getDate() + 7 * incremento);
        break;
      case "diario":
        date.setDate(date.getDate() + incremento);
        break;
      default:
        throw new Error(`Período desconhecido: ${periodo}`);
    }

    return date.toISOString().split("T")[0]; // Retorna apenas a data no formato 'YYYY-MM-DD'
  }

  async deleteSingleInstance(instanceId: number): Promise<void> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error("Database is not initialized");
      return;
    }

    try {
      const sql = `DELETE FROM instancias_recorrentes WHERE instancia_id = ?`;
      await db.run(sql, [instanceId]);

      console.log('Instância específica excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir a instância:', error);
    }
  }



  async removeAllRecorrenciasByTransacaoId(fk_transacao_id: number): Promise<void> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error("Database is not initialized");
      return;
    }

    try {
      // Consulta para remover todas as instâncias relacionadas à transação recorrente
      const sql = `DELETE FROM transacoes WHERE despesa_mae_id = ?`;

      // Executa a exclusão de todas as instâncias associadas
      await db.run(sql, [fk_transacao_id]);

      console.log(`Todas as instâncias da transação ${fk_transacao_id} foram removidas com sucesso.`);
    } catch (error) {
      console.error("Erro ao remover as instâncias:", error);
    }
  }

  // Função para calcular a data de vencimento de cada parcela
  calculateDueDate(mes_fatura: string, parcelaIndex: number): string {
    // Aqui você pode implementar a lógica para calcular a data de vencimento, 
    // começando com o mês da fatura e depois incrementando o mês para as parcelas subsequentes.
    const data = new Date(mes_fatura); // Mes e ano no formato "YYYY-MM"

    // A primeira parcela será no mês da fatura (sem incremento)
    data.setMonth(data.getMonth() + parcelaIndex); // Incrementa o mês da parcela conforme o índice (0 = mês da fatura)

    return data.toISOString().split('T')[0]; // Retorna a data no formato YYYY-MM-DD
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

  async getRecorrencias(): Promise<Transacao[]> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error("Database is not initialized");
      return [];
    }

    try {
      // Consulta para buscar as instâncias na tabela 'recorrenciasTable'
      const sql = `
        SELECT t.*, r.status AS instancia_status, r.instancia_id, r.data_transacao AS instancia_data
        FROM transacoes t
        INNER JOIN instancias_recorrentes r
        ON t.transacao_id = r.despesa_mae_id
      `;

      const result = await db.query(sql);
      const recorrencias: Transacao[] = Array.isArray(result.values)
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
            status: row.instancia_status, // Status específico da instância
            data_transacao: row.instancia_data,
            mes_fatura: row.mes_fatura,
            descricao_parcela: row.descricao_parcela,
            parcela_id: row.parcela_id,
            despesa_mae_id: row.despesa_mae_id, // ID da transação mãe
            instancia_id: row.instancia_id, // ID da recorrencia
          } as Transacao;
        })
        : [];

      return recorrencias;
    } catch (error) {
      console.error("Erro ao obter recorrências:", error);
      return [];
    }
  }

  async pagarInstanciaRecorrente(transacaoId: number): Promise<boolean> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return false;
    }

    const sql = `
      UPDATE transacoes 
      SET status = "pago" 
      WHERE transacao_id = ? AND is_recorrente = 1
    `;

    try {
      await db.query(sql, [transacaoId]);
      console.log(`Instância da transação ${transacaoId} marcada como paga.`);
      return true;
    } catch (error) {
      console.error(`Erro ao pagar instância da transação ${transacaoId}:`, error);
      return false;
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
            data_transacao: row.data_transacao,// caso precise
            mes_fatura: row.mes_fatura
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
      AND (num_parcelas < 1 OR num_parcelas IS NULL)
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

  async getReceitasByMonth(month: string): Promise<Transacao[]> {
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
    WHERE tipo = 'receita' AND data_transacao BETWEEN ? AND ?
  `;

    try {
      const result = await db.query(sql, [startOfMonth, endOfMonth]);
      return Array.isArray(result.values) ? result.values.map(this.mapRowToTransacao) : [];
    } catch (error) {
      console.error('Erro ao obter receitas de conta: ', error);
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


  async updateTransaction(
    transacao_id: number,
    conta_id: number | null,
    cartao_id: number | null,
    categoria_id: number,
    tipo: string,
    valor: number | null,
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

    const sql = `UPDATE transacoes SET 
                 conta_id = ?, cartao_id = ?, categoria_id = ?, tipo = ?, valor = ?, descricao = ?, 
                 is_parcelado = ?, num_parcelas = ?, valor_parcela = ?, is_recorrente = ?, 
                 quantidade_repetir = ?, periodo = ?, status = ?, 
                 fk_parcelas_parcela_id = ?, data_transacao = ?, mes_fatura = ?
                 WHERE transacao_id = ?`;

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
        valor_parcela,
        is_recorrente,
        quantidade_repetir,
        periodo,
        status,
        fk_parcelas_parcela_id,
        data_transacao,
        mes_fatura,
        transacao_id
      ]);
      console.log("Transação atualizada com sucesso!");

      // Atualiza as parcelas se a transação for parcelada
      if (is_parcelado && num_parcelas && valor_parcela && mes_fatura) {
        // Apaga parcelas existentes para recriá-las com as novas informações
        await db.run(`DELETE FROM parcelasTable WHERE transacao_id = ?`, [transacao_id]);

        for (let i = 0; i < num_parcelas; i++) {
          const vencimento = this.calculateDueDate(mes_fatura, i); // Calcula a data de vencimento para cada parcela
          const descricaoParcela = `${descricao} (${i + 1} de ${num_parcelas})`;

          const insertParcelaSql = `
            INSERT INTO parcelasTable 
            (transacao_id, valor_parcela, data_vencimento, status, descricao_parcela) 
            VALUES (?, ?, ?, ?, ?)
          `;

          await db.run(insertParcelaSql, [
            transacao_id,
            valor_parcela,
            vencimento,
            status,
            descricaoParcela
          ]);
        }
        console.log(`${num_parcelas} parcelas atualizadas com sucesso!`);
      } else {
        // Caso a transação não seja parcelada, remove parcelas existentes
        await db.run(`DELETE FROM parcelasTable WHERE transacao_id = ?`, [transacao_id]);
        console.log("Parcelas removidas, pois a transação não é mais parcelada.");
      }
    } catch (error) {
      console.error("Erro ao atualizar transação ou parcelas: ", error);
    }
  }

  async payExpense(transacao_id: number) {
    const db = this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    try {
      // Atualizar o status da transação para "pago"
      await db.run(`
        UPDATE transacoes
        SET status = 'pago'
        WHERE transacao_id = ?
      `, [transacao_id]);

      console.log(`Transação com ID ${transacao_id} foi marcada como paga.`);

      // Atualizar o status de todas as parcelas associadas a essa transação para "pago"
      await db.run(`
        UPDATE parcelasTable
        SET status = 'pago'
        WHERE transacao_id = ?
      `, [transacao_id]);

      console.log(`Todas as parcelas associadas à transação com ID ${transacao_id} foram marcadas como pagas.`);
    } catch (error) {
      console.error(`Erro ao pagar a transação e suas parcelas: ${error}`);
    }
  }

  async payInstance(instanceId: number): Promise<void> {
    const db = this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    try {
      // Atualizar o status da parcela para "pago"
      await db.run(`
        UPDATE instancias_recorrentes
        SET status = 'pago'
        WHERE instancia_id = ?
      `, [instanceId]);

      console.log(`Instancia com ID ${instanceId} foi marcada como paga.`);
    } catch (error) {
      console.error(`Erro ao pagar a parcela: ${error}`);
    }
  }

  async payInstallment(parcela_id: number) {
    const db = this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    try {
      // Atualizar o status da parcela para "pago"
      await db.run(`
        UPDATE parcelasTable
        SET status = 'pago'
        WHERE parcela_id = ?
      `, [parcela_id]);

      console.log(`Parcela com ID ${parcela_id} foi marcada como paga.`);
    } catch (error) {
      console.error(`Erro ao pagar a parcela: ${error}`);
    }
  }

  // Deletar uma transação
  async deleteTransaction(transacao_id: number) {
    const db = this.databaseService.getDb();

    if (!db) {
      console.error('O banco de dados não está inicializado.');
      return;
    }

    try {
      // Excluir parcelas associadas à transação
      await db.run(`
        DELETE FROM parcelasTable 
        WHERE transacao_id = ?
      `, [transacao_id]);

      console.log(`Parcelas associadas à transação com ID ${transacao_id} foram excluídas.`);

      // Excluir a transação
      await db.run(`
        DELETE FROM transacoes 
        WHERE transacao_id = ?
      `, [transacao_id]);

      console.log(`Transação com ID ${transacao_id} foi excluída com sucesso.`);
    } catch (error) {
      console.error(`Erro ao excluir a transação ou suas parcelas para o ID ${transacao_id}:`, error);
    }
  }

  async deleteInstallment(parcela_id: number) {
    const db = this.databaseService.getDb();

    if (!db) {
      console.error('O banco de dados não está inicializado.');
      return;
    }

    try {
      // Excluir a parcela com o ID especificado
      await db.run(`
        DELETE FROM parcelasTable 
        WHERE parcela_id = ?
      `, [parcela_id]);

      console.log(`Parcela com ID ${parcela_id} foi excluída com sucesso.`);
    } catch (error) {
      console.error(`Erro ao excluir a parcela com ID ${parcela_id}:`, error);
    }
  }


}
