import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private sqliteConnection: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  getDb(): SQLiteDBConnection | null {
    return this.db;
  }

  // Método para criar ou abrir a conexão com o banco de dados
  async createDatabaseConnection() {
    try {
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      this.db = await sqlite.createConnection('wallet3', false, 'no-encryption', 1, false);
      await this.db.open();
      console.log("Conexão com o banco de dados criada com sucesso!");
      // Crie a tabela aqui, se ainda não existir
      await this.createTables();
    } catch (error) {
      console.error("Erro ao criar conexão com o banco de dados:", error);
    }
  }

  // Criar a tabela de contas
  private async createTables() {
    if (!this.db) {
      console.error('Database is not initialized');
      return;
    }

    try {
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS accountTable (
        conta_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        instituicao TEXT NOT NULL,
        saldo REAL NOT NULL DEFAULT 0.00  -- Adicionando o campo saldo
        );
    `);

    await this.db.execute(`
      DROP TABLE IF EXISTS categories`);

      await this.db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        icone TEXT NOT NULL,
        tipo TEXT NOT NULL
      );
    `);


      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  // Método para fechar a conexão
  async closeDatabaseConnection() {
    try {
      await this.sqliteConnection.closeConnection('wallet3_db', false); // O banco não é somente leitura
      console.log("Conexão com o banco de dados 'wallet3_db' fechada.");
    } catch (error) {
      console.error("Erro ao fechar a conexão do banco de dados: ", error);
    }
  }
}
