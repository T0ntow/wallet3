import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DatabaseService } from '../database.service';
import { Card } from '../../models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private db!: SQLiteDBConnection;

  constructor(private databaseService: DatabaseService) {}

  // Adicionar novo cartão
  async addCard(
    nome: string,
    instituicao: string,
    limite_total: number,
    limite_atual: number,
    logo_url: string,
    dia_fechamento: string
  ): Promise<void> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    const sql = `INSERT INTO cartaoTable (nome, instituicao, limite_total,limite_atual, logo_url, dia_fechamento) VALUES (?, ?, ?, ?, ?, ?)`;
    try {
      await db.run(sql, [nome, instituicao, limite_total, limite_atual, logo_url, dia_fechamento]);
      console.log("Cartão inserido com sucesso!");
    } catch (error) {
      console.error("Erro ao inserir cartão: ", error);
    }
  }

  // Listar todos os cartões
  async getCards(): Promise<Card[]> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return [];
    }

    const sql = 'SELECT * FROM cartaoTable';
    try {
      const result = await db.query(sql);

      // Verifique se result.values está definido e é um array
      const cards: Card[] = Array.isArray(result.values) ? result.values.map((row) => {
        return {
          cartao_id: row.cartao_id,
          nome: row.nome,
          instituicao: row.instituicao,
          limiteTotal: row.limite_total || 0,
          limiteAtual: row.limite_atual || 0,
          logo_url: row.logo_url,
          dia_fechamento: row.dia_fechamento
        } as Card;
      }) : [];

      return cards;
    } catch (error) {
      console.error("Erro ao obter cartões: ", error);
      return [];
    }
  }

  // Buscar um cartão por ID
  async getCardById(cartao_id: number): Promise<Card | null> {
    const db = await this.databaseService.getDb();
    if (!db) {
      console.error('Database is not initialized');
      return null;
    }

    const sql = `SELECT * FROM cartaoTable WHERE cartao_id = ?`;
    try {
      const res = await db.query(sql, [cartao_id]);
      if (res.values && res.values.length > 0) {
        return res.values[0] as Card;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar cartão: ", error);
      return null;
    }
  }

  // Atualizar um cartão
  // async updateCard(
  //   cartao_id: number,
  //   nome: string,
  //   tipo: string,
  //   instituicao: string,
  //   limite: number,
  //   logo_url: string,
  //   dia_fechamento: string
  // ): Promise<void> {
  //   const db = await this.databaseService.getDb();
  //   if (!db) {
  //     console.error('Database is not initialized');
  //     return;
  //   }

  //   const sql = `UPDATE cartaoTable SET nome = ?, instituicao = ?, limite = ?, logo_url = ?, dia_fechamento = ? WHERE cartao_id = ?`;
  //   try {
  //     await db.run(sql, [nome, tipo, instituicao, limite, logo_url, dia_fechamento, cartao_id]);
  //     console.log("Cartão atualizado com sucesso!");
  //   } catch (error) {
  //     console.error("Erro ao atualizar cartão: ", error);
  //   }
  // }

  // Deletar um cartão
  async deleteCard(cartao_id: number): Promise<void> {
    const db = await this.databaseService.getDb();
    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    const sql = `DELETE FROM cartaoTable WHERE cartao_id = ?`;
    try {
      await db.run(sql, [cartao_id]);
      console.log("Cartão deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar cartão: ", error);
    }
  }
}