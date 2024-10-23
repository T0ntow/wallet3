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
      await this.db.execute(`DROP TABLE IF EXISTS transacoes`);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS accountTable (
        conta_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        instituicao TEXT NOT NULL,
        saldo REAL NOT NULL DEFAULT 0.00, -- Adicionando o campo saldo
        logo_url TEXT
        );
    `);

      await this.db.execute(`
          CREATE TABLE IF NOT EXISTS cartaoTable (
          cartao_id INTEGER PRIMARY KEY AUTOINCREMENT,
          conta_id INTEGER NOT NULL, -- Referência à tabela de contas
          dia_fechamento INTEGER NOT NULL, -- Dia do fechamento
          dia_vencimento INTEGER NOT NULL, -- Dia do vencimento
          nome TEXT NOT NULL, -- Nome do cartão
          limite REAL NOT NULL, -- Limite do cartão
          FOREIGN KEY (conta_id) REFERENCES accountTable(conta_id) -- Chave estrangeira para a tabela de contas
      );
  `);

      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS parcelasTable (
        parcela_id INTEGER PRIMARY KEY AUTOINCREMENT,
        transacao_id INTEGER NOT NULL, -- FK para relacionar com transações
        valor REAL NOT NULL,
        data_vencimento DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pendente', -- Campo para o status da parcela
        FOREIGN KEY (transacao_id) REFERENCES transacoes(transacao_id) -- Definindo a relação
        );
    `);



      await this.db.execute(`
          CREATE TABLE IF NOT EXISTS transacoes (
          transacao_id INTEGER PRIMARY KEY AUTOINCREMENT,
          conta_id INTEGER,
          cartao_id INTEGER,
          categoria_id INTEGER NOT NULL,
          tipo TEXT NOT NULL, -- Tipo de transação: "despesa" ou "receita"
          valor REAL NOT NULL, -- Valor da transação
          descricao TEXT, -- Descrição da transação
          is_parcelado BOOLEAN NOT NULL DEFAULT 0, -- Se a transação é parcelada (1 = sim, 0 = não)
          num_parcelas INTEGER, -- Número de parcelas, se parcelado
          is_recorrente BOOLEAN NOT NULL DEFAULT 0, -- Se a transação é recorrente (1 = sim, 0 = não)
          quantidade_repetir INTEGER, -- Quantidade de vezes que a transação se repete, se for recorrente
          periodo TEXT, -- Período de recorrência (e.g., semanal, mensal)
          status TEXT NOT NULL, -- Status da transação: "pago" ou "pendente"
          fk_parcelas_parcela_id INTEGER, -- FK para identificar parcelas, se for parcelada
          FOREIGN KEY (conta_id) REFERENCES accountTable(conta_id),
          FOREIGN KEY (cartao_id) REFERENCES cartaoTable(cartao_id),
          FOREIGN KEY (categoria_id) REFERENCES categories(id),
          FOREIGN KEY (fk_parcelas_parcela_id) REFERENCES parcelasTable(parcela_id),
          CHECK (
            (conta_id IS NOT NULL AND cartao_id IS NULL) -- Somente conta_id ou cartao_id pode ter valor, mas não ambos
            OR 
            (cartao_id IS NOT NULL AND conta_id IS NULL)
          )
      );

      `);

      // await this.db.execute(`DROP TABLE IF EXISTS categories`);

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
