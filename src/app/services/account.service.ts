import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, SQLiteDBConnection, capSQLiteSet } from '@capacitor-community/sqlite';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private db!: SQLiteDBConnection;

  constructor(private databaseService: DatabaseService) {}

  // Criar a tabela de contas
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS accountTable (
        conta_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        instituicao TEXT NOT NULL
      );
    `;

    try {
      const db = await this.databaseService.createDatabaseConnection();
      if (db) {
        await db.execute(sql);
        console.log("Tabela de contas criada/confirmada!");
      }
    } catch (error) {
    }
  }

  // Inserir nova conta
  async addAccount(nome: string, tipo: string, instituicao: string) {
    const sql = `INSERT INTO accountTable (nome, tipo, instituicao) VALUES (?, ?, ?)`;

    try {
      await this.db!.run(sql, [nome, tipo, instituicao]);
      console.log("Conta inserida com sucesso!");
    } catch (error) {
      console.error("Erro ao inserir conta: ", error);
    }
  }

  // Listar todas as contas
  async getAccounts() {
    const sql = `SELECT * FROM accountTable`;

    try {
      const res = await this.db!.query(sql);
      return res.values || [];
    } catch (error) {
      console.error("Erro ao buscar contas: ", error);
      return [];
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
