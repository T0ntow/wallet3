import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DatabaseService } from '../database.service';
import { Category } from 'src/app/models/category.model';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private db!: SQLiteDBConnection;

  constructor(private databaseService: DatabaseService) { }

  // Inserir nova categoria
  async addCategory(nome: string, icone: string, tipo: string): Promise<void> {
    const db = this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    const sql = `INSERT INTO categories (nome, icone, tipo) VALUES (?, ?,?)`;
    try {
      await db.run(sql, [nome, icone, tipo]);
      console.log("Categoria inserida com sucesso!");
    } catch (error) {
      console.error("Erro ao inserir categoria: ", error);
    }
  }

  // Listar todas as categorias
  async getCategories(): Promise<Category[]> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return [];
    }

    const sql = 'SELECT * FROM categories';

    try {
      const result = await db.query(sql);

      // Verifique se result.changes está definido e é um array
      const categories: Category[] = Array.isArray(result.values) ? result.values.map((row) => {
        return {
          id: row.id,
          nome: row.nome,
          icone: row.icone,
          tipo: row.tipo
        } as Category;
      }) : []; // Retorne um array vazio se não houver resultados

      return categories;
    } catch (error) {
      console.error("Erro ao obter categorias: ", error);
      return []; // Retorna um array vazio em caso de erro
    }
  }

  // Buscar uma categoria por ID
  async getCategoryById(id: number): Promise<Category | null> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return null;
    }

    const sql = `SELECT * FROM categories WHERE id = ?`;

    try {
      const res = await db.query(sql, [id]);
      if (res.values && res.values.length > 0) {
        return res.values[0];
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar categoria: ", error);
      return null;
    }
  }

  async updateCategory(id: number, nome: string, icone: IconDefinition, tipo: string): Promise<void> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    // Extrair o nome do ícone (se necessário)
    const iconName = icone.iconName || 'fa-ellipsis'; // Substitua "default-icon" por um valor padrão apropriado

    const sql = `UPDATE categories SET nome = ?, icone = ?, tipo = ? WHERE id = ?`;

    try {
      await db.run(sql, [nome, iconName, tipo, id]); // Salvar apenas o nome do ícone
      console.log("Categoria atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar categoria: ", error);
    }
  }

  // Deletar uma categoria
  async deleteCategory(id: number): Promise<void> {
    const db = await this.databaseService.getDb();

    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    const sql = `DELETE FROM categories WHERE id = ?`;

    try {
      await db.run(sql, [id]);
      console.log("Categoria deletada com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar categoria: ", error);
    }
  }
}
