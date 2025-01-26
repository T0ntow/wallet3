import { Component, ElementRef, inject, Input, OnInit, Renderer2, SimpleChanges } from '@angular/core';
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
import { EditReceiveComponent } from 'src/app/components/receives/edit-receive/edit-receive.component';
import { Moment } from 'moment';


@Component({
  selector: 'app-list-receives',
  templateUrl: './list-receives.component.html',
  styleUrls: ['./list-receives.component.scss'],
})
export class ListReceivesComponent implements OnInit {
  @Input() month: Moment = moment(); // Recebe o mês selecionado, inicializado com o mês atual

  segmentValue: string = 'despesas';  // Valor padrão do segmento

  receitasFiltradas: Transacao[] = []; // Array de receitas filtradas

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
  isModalReceitaOpen = false;

  selectedReceita: any = null;

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

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['month']) {
      const currentMonth = changes['month'].currentValue;
      await this.updateTransactionsByMonth(currentMonth.format('YYYY-MM'));
    }
  }

  async ngOnInit() {
    try {
      await this.initApp();

      // Load initial transactions by the current month
      await this.updateTransactionsByMonth(this.month.format('YYYY-MM'));
    } catch (error) {
      console.error("Error during initialization:", error);
    }

    // Subscription to handle transaction updates
    this.transactionService.transactionUpdated$.subscribe({
      next: () => {
        this.updateTransactionsByMonth(this.month.format('YYYY-MM'))
          .catch(err => console.error("Error updating transactions:", err));
      },
      error: err => console.error("Subscription error:", err)
    });
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

      const receitas = await this.transactionService.getReceitasByMonth(month);

      this.receitasFiltradas = [...receitas];

      console.log("Receitas filtradas:", this.receitasFiltradas);
      this.separarReceitas();
    } catch (error) {
      console.error("Erro ao atualizar transações pelo mês:", error);
    }
  }

  separarReceitas() {
    const receitasAgrupadas: Record<string, Transacao[]> = {}; // Objeto para armazenar as transações agrupadas
    const receitas = this.receitasFiltradas.filter(transacao => transacao.tipo === 'receita');

    // Agrupa receitas por data
    receitas.forEach(receita => {
      const data = moment(receita.data_transacao).format('YYYY-MM-DD');
      if (!receitasAgrupadas[data]) {
        receitasAgrupadas[data] = [];
      }
      receitasAgrupadas[data].push(receita);
    });

    // Salva os grupos ordenados
    this.receitasAgrupadas = this.ordenarGruposPorData(receitasAgrupadas);
  }

  // Função para ordenar os grupos por data
  ordenarGruposPorData(grupos: Record<string, any[]>) {
    return Object.keys(grupos)
      .sort((a, b) => moment(b).diff(moment(a))) // Ordena as datas de forma decrescente
      .map(data => ({ data, transacoes: grupos[data] }));
  }


  calcularTotalReceitas(): number {
    return this.receitasFiltradas.reduce((total, receita) => {
      const valor = Number(receita.valor) || 0;
      return total + valor;
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

  openModalReceita(receita: any) {
    this.selectedReceita = receita;
    this.isModalReceitaOpen = true;
  }

  closeModalReceita() {
    this.isModalReceitaOpen = false;
    this.selectedReceita = null; // Limpa a receita selecionada
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
