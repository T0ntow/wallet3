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
import { ModalController } from '@ionic/angular';
import { CardService } from 'src/app/services/card/card.service';
import { Card } from 'src/app/models/card.model';
import { EditExpenseComponent } from 'src/app/components/expenses/edit-expense/edit-expense.component';
import { EditCardExpenseComponent } from 'src/app/components/card-expenses/edit-card-expense/edit-card-expense.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  segmentValue: string = 'despesas';  // Valor padrão do segmento

  despesasFiltradas: Transacao[] = []; // Array de despesas filtradas
  receitasFiltradas: Transacao[] = []; // Array de receitas filtradas
  despesasContaFiltradas: Transacao[] = [];
  despesasCartaoFiltradas: Transacao[] = [];

  transactions: Transacao[] = []; // Array para armazenar todas as transações

  contas: Account[] = []; // Array para armazenar todas as contas
  cartoes: Card[] = []; // Array para armazenar todas as contas
  categorias: Category[] = []; // Array para armazenar todas as categorias

  isSheetVisible: boolean = false;


  transactionService = inject(TransactionsService);
  databaseService = inject(DatabaseService);
  accountService = inject(AccountService);
  categoriesService = inject(CategoryLoaderService);
  modalController = inject(ModalController)
  cardService = inject(CardService)


  currentMonth = moment(); // Inicializa com o mês atual

  faBus = faBus;

  isModalOpen = false;
  selectedDespesa: any = null;

  constructor() { }

  async loadCards() {
    try {
      this.cartoes = await this.cardService.getCards(); // Carrega todas as contas
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
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


  async ngOnInit() {
    try {
      await this.databaseService.createDatabaseConnection();

      // Sequential loading of accounts and categories with individual error handling
      await this.loadAccounts().catch(error => console.error("Error loading accounts:", error));
      await this.loadCategories().catch(error => console.error("Error loading categories:", error));
      await this.loadCards().catch(error => console.error("Error loading cards:", error));

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

    // Obtém as despesas de cartão e conta
    const despesas = await this.transactionService.getAllTransactions();
    const despesasCartao = await this.transactionService.getDespesasCartaoByMonth(month);
    const despesasConta = await this.transactionService.getDespesasContaByMonth(month);
    console.log("despesasCartao", JSON.stringify(despesasCartao));
    console.log("despesasConta", JSON.stringify(despesasConta));

    // Obter parcelas pendentes para o mês
    const installmentsResult = await this.transactionService.getParcelasByMonth(month);
    console.log("PARCELAS", JSON.stringify(installmentsResult));

    // Mapeia as parcelas para incluir detalhes da despesa associada
    const mappedInstallments = installmentsResult.map(installment => {
      const associatedExpense = despesas.find(transaction => transaction.transacao_id === installment.transacao_id);

      // Extrair as informações da despesa associada
      const associatedExpenseData = associatedExpense ? {
        tipo: associatedExpense.tipo,
        descricao: associatedExpense.descricao,
        categoria_id: associatedExpense.categoria_id,
        cartao_id: associatedExpense.cartao_id,
        is_parcelado: associatedExpense.is_parcelado,
        num_parcelas: associatedExpense.num_parcelas,
        data_transacao: associatedExpense.data_transacao
      } : null;

      // Retornar a parcela com a despesa associada separada
      return {
        ...installment,
        ...associatedExpenseData // Inclui as propriedades diretamente no objeto da parcela
      };
    });

    // Preenche a lista de despesas combinadas
    this.despesasFiltradas = [
      ...despesasCartao,
      ...despesasConta,
      ...mappedInstallments // Inclui as parcelas mapeadas dentro do mês
    ];

    // console.log("Despesas e Parcelas", JSON.stringify(this.despesasFiltradas));

    // Chama a função para separar e processar as despesas e receitas
    this.separarDespesasEReceitas();
  }

  separarDespesasEReceitas() {
    // Filtra as despesas do tipo 'cartão' e 'conta'
    this.despesasCartaoFiltradas = this.despesasFiltradas.filter(transacao => transacao.cartao_id);
    this.despesasContaFiltradas = this.despesasFiltradas.filter(transacao => !transacao.cartao_id);

    // console.log("Despesas de Cartão", JSON.stringify(this.despesasCartaoFiltradas));
    // console.log("Despesas de Conta", JSON.stringify(this.despesasContaFiltradas));

    // Filtra as receitas
    this.receitasFiltradas = this.despesasFiltradas.filter(transacao => transacao.tipo === 'receita');

    // Ordena as despesas de cartão, conta e receitas por data
    this.despesasCartaoFiltradas.sort((a, b) => moment(b.mes_fatura).diff(moment(a.mes_fatura)));
    this.despesasContaFiltradas.sort((a, b) => moment(b.data_transacao).diff(moment(a.data_transacao)));
    this.receitasFiltradas.sort((a, b) => moment(b.data_transacao).diff(moment(a.data_transacao)));

    // Combina as despesas de cartão e conta para o mês atual
    this.despesasFiltradas = [
      ...this.despesasCartaoFiltradas,
      ...this.despesasContaFiltradas
    ];
  }

  calcularTotalDespesas(): number {
    return this.despesasFiltradas.reduce((total, despesa) => {
      // Garantir que tanto valor quanto valor_parcela sejam números válidos
      const valor = Number(despesa.valor) || 0;
      const valorParcela = Number(despesa.valor_parcela) || 0; 
      return total + valor + valorParcela;
    }, 0);
  }
  
  calcularTotalPendentes(): number {
    return this.despesasFiltradas
      .filter(despesa => despesa.status === 'pendente')
      .reduce((total, despesa) => {
        const valor = Number(despesa.valor) || 0; 
        const valorParcela = Number(despesa.valor_parcela) || 0; 
        return total + valor + valorParcela;
      }, 0);
  }
  
  getAccountNameById(conta_id: number): string {
    const conta = this.contas.find(account => account.conta_id === conta_id);
    return conta ? conta.nome : 'Conta desconhecida'; // Retorna o nome ou uma string padrão
  }

  getCardNameById(cartao_id: number): string {
    const cartao = this.cartoes.find(card => card.cartao_id === cartao_id);
    return cartao ? cartao.nome : 'Cartão desconhecido'; // Retorna o nome ou uma string padrão
  }

  getIconByCategoryId(categoryId: number): IconDefinition | null {
    const category = this.categorias.find(cat => cat.id === categoryId);
    return category ? category.icone : null; // Retorna o ícone ou null se não encontrado
  }

  getCategoryNameById(id: number): string {
    const categoria = this.categorias.find(cat => cat.id === id);
    return categoria ? categoria.nome : 'Categoria desconhecida';
  }


  openModal(despesa: any) {
    this.selectedDespesa = despesa;
    console.log("this.selectedDespesa", JSON.stringify(this.selectedDespesa));

    this.isModalOpen = true;
  }


  closeModal() {
    console.log("CLOSE MODAL");

    this.isModalOpen = false;
    this.selectedDespesa = null; // Limpa a despesa selecionada
  }

  async editExpense(despesa: Transacao) {
    if(despesa.cartao_id) {
      const modal = await this.modalController.create({
        component: EditCardExpenseComponent,
        componentProps: {despesa: despesa}
      });
      modal.onDidDismiss().then((data) => {
        if (data.data) {
          this.transactionService.notifyTransactionUpdate()
        }
      });
      return await modal.present();
    }

    if (despesa.conta_id) {
      const modal = await this.modalController.create({
        component: EditExpenseComponent,
        componentProps: {despesa: despesa}
      });
      modal.onDidDismiss().then((data) => {
        if (data.data) {
          this.transactionService.notifyTransactionUpdate()
        }
      });
  
      return await modal.present();
    }
  }
}
