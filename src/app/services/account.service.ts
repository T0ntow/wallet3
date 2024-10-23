import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, SQLiteDBConnection, capSQLiteSet } from '@capacitor-community/sqlite';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { DatabaseService } from './database.service';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private db!: SQLiteDBConnection;

  constructor(private databaseService: DatabaseService) {}

  // Inserir nova conta
  async addAccount(nome: string, tipo: string, instituicao: string, saldo: number): Promise<void> {
    const db = this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    const sql = `INSERT INTO accountTable (nome, tipo, instituicao, saldo) VALUES (?, ?, ?, ?)`;
    try {
      await db.run(sql, [nome, tipo, instituicao, saldo]);
      console.log("Conta inserida com sucesso!");
    } catch (error) {
      console.error("Erro ao inserir conta: ", error);
    }
  }

  // Listar todas as contas
  async getAccounts(): Promise<Account[]> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return [];
    }

    const sql = 'SELECT * FROM accountTable';
  
    try {
      const result = await db.query(sql);
  
      // Verifique se result.changes está definido e é um array
      const accounts: Account[] = Array.isArray(result.values) ? result.values.map((row) => {
        return {
          conta_id: row.conta_id,
          nome: row.nome,
          tipo: row.tipo,
          instituicao: row.instituicao,
          saldo: row.saldo || 0, // Certifique-se de obter o saldo, se disponível

        } as Account;
      }) : []; // Retorne um array vazio se não houver resultados
  
      return accounts;
    } catch (error) {
      console.error("Erro ao obter contas: ", error);
      return []; // Retorna um array vazio em caso de erro
    }
  }
  
  // Buscar uma conta por ID
  async getAccountById(conta_id: number) {
    const sql = `SELECT * FROM accountTable WHERE conta_id = ?`;

    try {
      const res = await this.db!.query(sql, [conta_id]);
      if (res.values && res.values.length > 0) {
        return res.values[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar conta: ", error);
      return null;
    }
  }

  // Atualizar uma conta
  async updateAccount(conta_id: number, nome: string, tipo: string, instituicao: string) {
    const sql = `UPDATE accountTable SET nome = ?, tipo = ?, instituicao = ? WHERE conta_id = ?`;

    try {
      await this.db!.run(sql, [nome, tipo, instituicao, conta_id]);
      console.log("Conta atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar conta: ", error);
    }
  }

  // Deletar uma conta
  async deleteAccount(conta_id: number) {
    const sql = `DELETE FROM accountTable WHERE conta_id = ?`;

    try {
      await this.db!.run(sql, [conta_id]);
      console.log("Conta deletada com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar conta: ", error);
    }
  }
}
