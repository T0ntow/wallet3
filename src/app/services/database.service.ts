import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private sqliteConnection: SQLiteConnection;
  private db!: SQLiteDBConnection;

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  // Método para criar ou abrir a conexão com o banco de dados
  async createDatabaseConnection() {
    try {
      if (Capacitor.getPlatform() === 'web') {
        throw new Error('O SQLite não está disponível na web.');
      }

      this.db = await this.sqliteConnection.createConnection(
        'wallet3_db',        // Nome do banco de dados (wallet3)
        false,               // Banco não criptografado
        'no-encryption',     // Sem criptografia
        1,                   // Versão do banco de dados
        false                // Não é readonly
      );

      await this.db.open();
      console.log("Banco de dados 'wallet3_db' criado/aberto com sucesso!");

      return this.db;
    } catch (error) {
      console.error("Erro ao criar ou abrir a conexão com o banco de dados: ", error);
      return null;
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
