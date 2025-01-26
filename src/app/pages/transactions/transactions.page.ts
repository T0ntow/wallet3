import { Component, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';
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
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { CardService } from 'src/app/services/card/card.service';
import { Card } from 'src/app/models/card.model';
import { EditExpenseComponent } from 'src/app/components/expenses/edit-expense/edit-expense.component';
import { EditCardExpenseComponent } from 'src/app/components/card-expenses/edit-card-expense/edit-card-expense.component';
import { Parcela } from 'src/app/models/parcela.model';
import { EditReceiveComponent } from 'src/app/components/receives/edit-receive/edit-receive.component';

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
  alertController = inject(AlertController)
  toastController = inject(ToastController)

  currentMonth = moment(); // Inicializa com o mês atual

  faBus = faBus;

  isModalDespesaOpen = false;
  isModalReceitaOpen = false;

  selectedDespesa: any = null;
  selectedReceita: any = null;

  despesasAgrupadas: { data: string; transacoes: Transacao[]; }[] | undefined;
  receitasAgrupadas: { data: string; transacoes: Transacao[]; }[] | undefined;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
  ) { }

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
      console.log("CATEGORIAS");

    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  }

  async ngOnInit() {
    try {
      await this.initApp();

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

    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (this.mostrarViewPicker && !this.elRef.nativeElement.contains(event.target)) {
        this.toggleView();
      }
    });
  }

  selectedView: string = 'Transações'; // Valor padrão
  mostrarViewPicker: boolean = false;
  toggleView() {
    this.mostrarViewPicker = !this.mostrarViewPicker;
  }

  cancelar() {
    this.mostrarViewPicker = false;
  }


  selectView(view: string) {
    this.selectedView = view
    this.mostrarViewPicker = !this.mostrarViewPicker;
  }

  async initApp() {
    await this.databaseService.createDatabaseConnection();

    // Sequential loading of accounts and categories with individual error handling
    await this.loadAccounts().catch(error => console.error("Error loading accounts:", error));
    await this.loadCategories().catch(error => console.error("Error loading categories:", error));
    await this.loadCards().catch(error => console.error("Error loading cards:", error));
  }

  async updateTransactionsByMonth(month: string) {
    try {
      await this.initApp();

      this.currentMonth = moment(month); // Atualiza currentMonth com o novo mês

      // Obtém todas as despesas
      const despesas = await this.transactionService.getAllTransactions();

      // Obter despesas recorrentes e filtrar pelo mês
      const recurringExpenses = await this.transactionService.getRecorrencias();
      console.log("RECORRENTES --: ", JSON.stringify(recurringExpenses));

      const filteredRecurringExpenses = await this.filterRecurringExpensesByType(recurringExpenses, month);
      console.log("RECORRENTES FILTRADAS --: ", JSON.stringify(filteredRecurringExpenses));


      // Obtém despesas de cartão e conta
      const [despesasCartao, despesasConta] = await Promise.all([
        this.transactionService.getDespesasCartaoByMonth(month),
        this.transactionService.getDespesasContaByMonth(month),
      ]);

      // Obtém receitas
      const receitas = await this.transactionService.getReceitasByMonth(month);

      // Obter parcelas pendentes para o mês
      const installmentsResult = await this.transactionService.getParcelasByMonth(month);

      // Mapeia as parcelas para incluir detalhes da despesa associada
      const mappedInstallments = installmentsResult.map((installment) => {
        const associatedExpense = despesas.find((transaction) => transaction.transacao_id === installment.transacao_id);

        // Retorna a parcela com os detalhes associados
        return {
          ...installment,
          ...associatedExpense, // Inclui propriedades diretamente no objeto da parcela
        };
      });

      // Preenche a lista de despesas combinadas
      this.despesasFiltradas = [
        ...despesasCartao,
        ...despesasConta,
        ...mappedInstallments, // Inclui as parcelas mapeadas dentro do mês
        ...filteredRecurringExpenses, // Inclui as despesas recorrentes filtradas
      ];

      this.receitasFiltradas = [...receitas];

      console.log("Receitas filtradas:", this.receitasFiltradas);
      console.log("Despesas filtradas:", JSON.stringify(this.despesasFiltradas));

      // Chama a função para separar e processar as despesas e receitas
      this.separarDespesasEReceitas();
    } catch (error) {
      console.error("Erro ao atualizar transações pelo mês:", error);
    }
  }

  async filterRecurringExpensesByType(
    recurringExpenses: Transacao[],
    month: string
  ): Promise<Transacao[]> {
    const currentMonth = moment(month, 'YYYY-MM'); // Representa o mês atual
    const filteredExpenses: Transacao[] = [];

    recurringExpenses.forEach((expense) => {
      const transactionDate = moment(expense.data_transacao, 'YYYY-MM-DD'); // Data da transação

      // Verifica se a data da transação pertence ao mês fornecido
      if (transactionDate.isSame(currentMonth, 'month')) {
        filteredExpenses.push(expense);
      }
    });

    return filteredExpenses;
  }

  separarDespesasEReceitas() {
    // Agrupa despesas e receitas por data
    const despesasAgrupadas: Record<string, Transacao[]> = {}; // Objeto para armazenar as transações agrupadas
    const receitasAgrupadas: Record<string, Transacao[]> = {}; // Objeto para armazenar as transações agrupadas

    // Filtra despesas e receitas
    const despesas = this.despesasFiltradas.filter(transacao => transacao.tipo === 'despesa');
    const receitas = this.receitasFiltradas.filter(transacao => transacao.tipo === 'receita');

    // Agrupa despesas por data
    despesas.forEach(despesa => {
      const data = moment(despesa.data_transacao).format('YYYY-MM-DD');
      if (!despesasAgrupadas[data]) {
        despesasAgrupadas[data] = [];
      }
      despesasAgrupadas[data].push(despesa);
    });

    // Agrupa receitas por data
    receitas.forEach(receita => {
      const data = moment(receita.data_transacao).format('YYYY-MM-DD');
      if (!receitasAgrupadas[data]) {
        receitasAgrupadas[data] = [];
      }
      receitasAgrupadas[data].push(receita);
    });

    // Salva os grupos ordenados
    this.despesasAgrupadas = this.ordenarGruposPorData(despesasAgrupadas);
    this.receitasAgrupadas = this.ordenarGruposPorData(receitasAgrupadas);
  }

  // Função para ordenar os grupos por data
  ordenarGruposPorData(grupos: Record<string, any[]>) {
    return Object.keys(grupos)
      .sort((a, b) => moment(b).diff(moment(a))) // Ordena as datas de forma decrescente
      .map(data => ({ data, transacoes: grupos[data] }));
  }


  calcularTotalDespesas(): number {
    return this.despesasFiltradas.reduce((total, despesa) => {
      // Garantir que tanto valor quanto valor_parcela sejam números válidos
      const valor = Number(despesa.valor) || 0;
      const valorParcela = Number(despesa.valor_parcela) || 0;
      return total + valor + valorParcela;
    }, 0);
  }

  calcularTotalReceitas(): number {
    return this.receitasFiltradas.reduce((total, receita) => {
      const valor = Number(receita.valor) || 0;
      return total + valor;
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

  openModalDespesa(despesa: any) {
    this.selectedDespesa = despesa;
    console.log("this.selectedDespesa", JSON.stringify(this.selectedDespesa));

    this.isModalDespesaOpen = true;
  }

  openModalReceita(receita: any) {
    this.selectedReceita = receita;
    console.log("this.selectedDespesa", JSON.stringify(this.selectedDespesa));

    this.isModalReceitaOpen = true;
  }

  closeModalDespesa() {
    this.isModalDespesaOpen = false;
    this.selectedDespesa = null; // Limpa a despesa selecionada
  }

  closeModalReceita() {
    this.isModalReceitaOpen = false;
    this.selectedReceita = null; // Limpa a receita selecionada
  }

  async editExpense(despesa: Transacao) {
    if (despesa.cartao_id) {
      const modal = await this.modalController.create({
        component: EditCardExpenseComponent,
        componentProps: { despesa: despesa }
      });
      modal.onDidDismiss().then((data) => {
        if (data.data) {
          this.transactionService.notifyTransactionUpdate()
          this.closeModalDespesa();
        }
      });
      return await modal.present();
    }

    if (despesa.conta_id) {
      const modal = await this.modalController.create({
        component: EditExpenseComponent,
        componentProps: { despesa: despesa }
      });
      modal.onDidDismiss().then((data) => {
        if (data.data) {
          this.transactionService.notifyTransactionUpdate()
          this.closeModalDespesa();
        }
      });

      return await modal.present();
    }
  }

  async editIncome(receita: Transacao) {
    if (receita.conta_id) {
      const modal = await this.modalController.create({
        component: EditReceiveComponent,
        componentProps: { receita: receita }
      });
      modal.onDidDismiss().then((data) => {
        if (data.data) {
          this.transactionService.notifyTransactionUpdate()
          this.closeModalReceita();
        }
      });

      return await modal.present();
    }
  }

  async payExpense(despesa: Transacao) {
    if (despesa.transacao_id) {
      try {
        await this.transactionService.payExpense(despesa.transacao_id);
        this.closeModalDespesa();
        console.log(`Despesa com ID ${despesa.transacao_id} foi marcada como paga.`);
        this.transactionService.notifyTransactionUpdate()
      } catch (error) {
        this.closeModalDespesa();
        console.error('Erro ao pagar a despesa:', error);
      }
    }
  }

  async payInstallment(parcela: Parcela) {
    if (parcela.parcela_id) {
      try {
        await this.transactionService.payInstallment(parcela.parcela_id);
        this.closeModalDespesa();
        console.log(`Parcela com ID ${parcela.parcela_id} foi marcada como paga.`);
        this.transactionService.notifyTransactionUpdate()

      } catch (error) {
        this.closeModalDespesa();
        console.error('Erro ao pagar a parcela:', error);
      }
    }
  }

  async payInstance(transacao: Transacao) {
    if (transacao.instancia_id) {
      try {
        await this.transactionService.payInstance(transacao.instancia_id);
        this.closeModalDespesa();
        console.log(`Instancia com ID ${transacao.instancia_id} foi marcada como paga.`);
        this.transactionService.notifyTransactionUpdate()

      } catch (error) {
        this.closeModalDespesa();
        console.error('Erro ao pagar a instancia:', error);
      }
    }
  }

  async deleteExpense(despesa: Transacao) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza de que deseja excluir a despesa?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('A exclusão da despesa foi cancelada.');
          },
        },
        {
          text: 'Excluir',
          handler: async () => {
            if (despesa.transacao_id) {
              try {
                await this.transactionService.deleteTransaction(despesa.transacao_id);
                this.closeModalDespesa();
                console.log(`Despesa com ID ${despesa.transacao_id} foi deletada.`);
                await this.presentToast('Despesa excluida com sucesso!', 'light');

                this.transactionService.notifyTransactionUpdate();
              } catch (error) {
                this.closeModalDespesa();
                console.error('Erro ao excluir a despesa:', error);
                await this.presentToast('Erro ao excluir a despesa', 'danger');

              }
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteSingleInstance(despesa: Transacao) {
    console.log("DELETE INSTANCIA", JSON.stringify(despesa));

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza de que deseja excluir esta instância?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('A exclusão da despesa foi cancelada.');
          },
        },
        {
          text: 'Excluir',
          handler: async () => {
            if (despesa.instancia_id) {
              try {
                await this.transactionService.deleteSingleInstance(despesa.instancia_id);
                this.closeModalDespesa();
                console.log(`Despesa com ID ${despesa.transacao_id} foi deletada.`);
                await this.presentToast('Despesa excluida com sucesso!', 'light');

                this.transactionService.notifyTransactionUpdate();
              } catch (error) {
                this.closeModalDespesa();
                console.error('Erro ao excluir a despesa:', error);
                await this.presentToast('Erro ao excluir a despesa', 'danger');

              }
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteIncome(receita: Transacao) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza de que deseja excluir a receita?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('A exclusão da receita foi cancelada.');
          },
        },
        {
          text: 'Excluir',
          handler: async () => {
            if (receita.transacao_id) {
              try {
                await this.transactionService.deleteTransaction(receita.transacao_id);
                this.closeModalReceita();
                console.log(`Receita com ID ${receita.transacao_id} foi deletada.`);
                await this.presentToast('Receita excluida com sucesso!', 'light');

                this.transactionService.notifyTransactionUpdate();
              } catch (error) {
                this.closeModalReceita();
                console.error('Erro ao excluir a receita:', error);
                await this.presentToast('Erro ao excluir a receita', 'danger');

              }
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteInstallment(parcela: Parcela) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza de que deseja excluir a parcela?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('A exclusão da parcela foi cancelada.');
          },
        },
        {
          text: 'Excluir',
          handler: async () => {
            if (parcela.parcela_id) {
              try {
                await this.transactionService.deleteInstallment(parcela.parcela_id);
                this.closeModalDespesa();
                console.log(`Parcela com ID ${parcela.parcela_id} foi deletada.`);
                await this.presentToast('Parcela excluida com sucesso!', 'light');

                this.transactionService.notifyTransactionUpdate();
              } catch (error) {
                this.closeModalDespesa();
                console.error('Erro ao excluir a parcela:', error);
                await this.presentToast('Erro ao excluir parcela', 'danger');
              }
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      color,
      position: "top"
    });
    toast.present();
  }
}
