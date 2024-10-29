import { Component, inject, OnInit } from '@angular/core';
import * as moment from 'moment';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';
import { Transacao } from 'src/app/models/transaction.model';
import { DatabaseService } from 'src/app/services/database.service';
import { Account } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account/account.service';
import { Category } from 'src/app/models/category.model';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faBus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  segmentValue: string = 'despesas';  // Valor padrão do segmento
  despesasFiltradas: Transacao[] = []; // Array de despesas filtradas
  receitasFiltradas: Transacao[] = []; // Array de receitas filtradas
  transactions: Transacao[] = []; // Array para armazenar todas as transações

  contas: Account[] = []; // Array para armazenar todas as contas
  categorias: Category[] = []; // Array para armazenar todas as categorias

  isSheetVisible: boolean = false;


  transactionService = inject(TransactionsService);
  databaseService = inject(DatabaseService);
  accountService = inject(AccountService);
  categoriesService = inject(CategoryLoaderService);

  currentMonth = moment(); // Inicializa com o mês atual


  faBus = faBus;

  constructor() { }

  async ngOnInit() {
    try {
      await this.databaseService.createDatabaseConnection();

      // Sequential loading of accounts and categories with individual error handling
      await this.loadAccounts().catch(error => console.error("Error loading accounts:", error));
      await this.loadCategories().catch(error => console.error("Error loading categories:", error));

      // Load initial transactions by the current month
      await this.updateTransactionsByMonth(this.currentMonth.format('YYYY-MM'));
    } catch (error) {
      console.error("Error during initialization:", error);
    }

    // Subscription to handle transaction updates
    this.transactionService.transactionUpdated$.subscribe({
      next: () => {
        this.updateTransactionsByMonth(this.currentMonth.format('YYYY-MM'))
          .catch(err => console.error("Error updating transactions:", err));
      },
      error: err => console.error("Subscription error:", err)
    });
  }

  async updateTransactionsByMonth(month: string) {
    console.log("MES", month); // Formato 'YYYY-MM'
    this.currentMonth = moment(month); // Atualiza currentMonth com o novo mês

    this.transactions = await this.transactionService.getTransactionsByMonth(month);
    console.log("this.transactions", JSON.stringify(this.transactions));


    this.separarDespesasEReceitas();
  }

  async loadAccounts() {
    try {
      this.contas = await this.accountService.getAccounts(); // Carrega todas as contas
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  }

  async loadCategories() {
    try {
      this.categorias = await this.categoriesService.loadCategories(); // Carrega todas as contas
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  }

  separarDespesasEReceitas() {
    this.despesasFiltradas = this.transactions.filter(transacao => transacao.tipo === 'despesa');
    console.log("this.despesasFiltradas", this.despesasFiltradas);

    this.receitasFiltradas = this.transactions.filter(transacao => transacao.tipo === 'receita');

    // Ordena as transações por data, da mais recente para a mais antiga
    this.despesasFiltradas.sort((a, b) => moment(b.data_transacao).diff(moment(a.data_transacao)));
    this.receitasFiltradas.sort((a, b) => moment(b.data_transacao).diff(moment(a.data_transacao)));
  }

  calcularTotalDespesas(): number {
    return this.despesasFiltradas.reduce((total, despesa) => total + despesa.valor, 0);
  }

  calcularTotalPendentes(): number {
    return this.despesasFiltradas.filter(despesa => despesa.status === 'pendente')
      .reduce((total, despesa) => total + despesa.valor, 0);
  }

  getAccountNameById(conta_id: number): string {
    const conta = this.contas.find(account => account.conta_id === conta_id);
    return conta ? conta.nome : 'Conta desconhecida'; // Retorna o nome ou uma string padrão
  }

  getIconByCategoryId(categoryId: number): IconDefinition | null {
    const category = this.categorias.find(cat => cat.id === categoryId);
    console.log("category ===", category);

    return category ? category.icone : null; // Retorna o ícone ou null se não encontrado
  }

  toggleSheet() {
    console.log(this.isSheetVisible);
    
    this.isSheetVisible = !this.isSheetVisible; // Alterna a visibilidade do sheet
  }

  closeSheet() {
    this.isSheetVisible = false; // Fecha o sheet quando clicar fora
  }

}
