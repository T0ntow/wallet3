import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { IonToggle, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/pt-br';  // Importa o locale para português
import { Category } from 'src/app/models/category.model';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';
import { Card } from 'src/app/models/card.model';
import { CardService } from 'src/app/services/card/card.service';
import { Transacao } from 'src/app/models/transaction.model';
import { MaskitoElementPredicate } from '@maskito/core';
import { maskitoPrice } from '../../../mask';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-edit-card-expense',
  templateUrl: './edit-card-expense.component.html',
  styleUrls: ['./edit-card-expense.component.scss'],
})
export class EditCardExpenseComponent implements OnInit {

  transacaoForm: FormGroup;
  selectedCard: string = '';
  selectedCategory: string = '';
  selectedInvoice: string = '';

  // Fatura mes
  invoices: { label: string, date: moment.Moment }[] = [];

  //toggle parcelado
  parcelado: boolean = false; // Estado para controle de "parcelado"

  //Categorias
  categories: Category[] = [];
  cards: Card[] = [];

  categoryLoaderService = inject(CategoryLoaderService)
  cardService = inject(CardService)
  transactionService = inject(TransactionsService)
  toastController = inject(ToastController)

  @Input() despesa: Transacao | undefined;

  isModalOpen = false;
  selectedCardLogo: string | undefined;
  selectedCategoryIcon: IconDefinition | undefined;

  installments: { label: string; value: number; quantidade_parcelas: number; }[] | undefined;

  installmentCount = 12; // Valor inicial padrão
  customInstallmentCount: number | null = null;
  singleInstallment: any | null = null; // Para exibir apenas a parcela digitada

  myValue: boolean = false;

  readonly maskitoPrice = maskitoPrice;
  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.transacaoForm = this.formBuilder.group({
      descricao: ['', Validators.required],
      cartao_id: [null, Validators.required],
      categoria_id: [null, Validators.required],
      data: ['', Validators.required],
      valor: [(0).toFixed(2).replace('.', ','), [Validators.required, Validators.min(0)]], // Valor inicial como null e validado como número
      valor_parcela: [{ value: null, disabled: true }, [Validators.min(0)]], // Inicialmente desabilitado e validado como número
      status: ['pendente', Validators.required],
      tipo: ['despesa'],
      is_parcelado: [false],
      num_parcelas: [null, [Validators.min(2), Validators.max(100)]], // Validador para garantir que seja entre 2 e 100
      is_recorrente: [false],
      quantidade_repetir: [null],
      periodo: [null],
      mes_fatura: [null, Validators.required]
    });
  }

  @ViewChild('popover') popover: { event: Event; } | undefined;
  @ViewChild('mytoggle', { static: true }) mytoggle: IonToggle | undefined;

  isOpen = false;

  presentPopover(e: Event) {
    this.popover!.event = e;
    this.isOpen = true;
  }

  async ngOnInit() {
    // Se `despesa` estiver definida, inicializa os valores do formulário com ela
    if (this.despesa) {
      console.log("Despesa Recebida", JSON.stringify(this.despesa));

      this.transacaoForm.patchValue({
        descricao: this.despesa.descricao,
        cartao_id: this.despesa.cartao_id,
        data: this.despesa.data_transacao,
        valor: this.despesa.valor,
        status: this.despesa.status,
        num_parcelas: this.despesa.num_parcelas,
        valor_parcela: this.despesa.valor_parcela,
      });

      this.transacaoForm.patchValue({
        is_parcelado: this.despesa.is_parcelado === 1 ? true : false
      });
    }

    try {
      this.categories = await this.categoryLoaderService.loadCategoriesByExpenses();
      this.cards = await this.cardService.getCards();

      // Despesa titpo conta
      if (this.despesa && this.despesa.cartao_id) {
        this.getCategoryById(this.despesa?.categoria_id);
        this.getCardById(this.despesa?.cartao_id);
      }

      if (this.despesa && this.despesa.mes_fatura) {
        this.getInvoiceByDate(this.despesa.mes_fatura)
      }

    } catch (error) {
      console.error('Error loading categories or accounts:', error);
    }

    this.transacaoForm.get('is_parcelado')?.valueChanges.subscribe(isParcelado => {
      this.parcelado = isParcelado;
      const numParcelasControl = this.transacaoForm.get('num_parcelas');
      const valorParcela = this.transacaoForm.get('valor_parcela');


      if (this.parcelado) {
        numParcelasControl?.setValidators([Validators.required, Validators.min(2), Validators.max(100)]);
        valorParcela?.setValidators([Validators.required, Validators.min(0)]);

        valorParcela?.enable();  // Habilita o campo
        numParcelasControl?.enable();  // Habilita o campo
      } else {
        numParcelasControl?.clearValidators();  // Remove o validador
        numParcelasControl?.disable();  // Desabilita o campo

        valorParcela?.clearValidators();  // Remove o validador
        valorParcela?.disable();  // Desabilita o campo
      }

      numParcelasControl?.updateValueAndValidity();  // Atualiza a validade do campo
      valorParcela?.updateValueAndValidity();  // Atualiza a validade do campo
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  getCardById(id: number) {
    const firstAccount = this.cards[0];
    this.selectedCardLogo = firstAccount.logo_url;

    const card = this.cards.find(card => card.cartao_id === id);
    if (card)
      this.selectCardInitial(card);
  }

  getCategoryById(id: number) {
    const firstCategory = this.categories[0];
    this.selectedCategoryIcon = firstCategory.icone;
    
    const category = this.categories.find(category => category.id === id);
    if (category)
      this.selectCategoryInitial(category);
  }

  getInvoiceByDate(date: string) {
    console.log("getInvoiceByDate");

    const targetDate = moment(date, 'YYYY-MM-DD'); // Parse a data no formato correto
    const invoice = this.invoices.find(invoice =>
      moment(invoice.date, 'YYYY-MM-DD').isSame(targetDate, 'month') // Comparar apenas o mês
    );
    if (invoice) {
      this.selectInvoiceInitial(invoice);
    }
  }

  async selectCardInitial(card: Card) {
    this.selectedCard = card.nome;
    this.transacaoForm.patchValue({ cartao_id: card.cartao_id }); // Atualiza o valor do ícone no formulário
    this.generateInvoiceOptions(card); // Gera opções de fatura para o cartão selecionado
  }

  async selectCategoryInitial(category: Category) {
    this.selectedCategory = category.nome;
    this.transacaoForm.patchValue({ categoria_id: category.id }); // Atualiza o valor do ícone no formulário
  }

  async selectInvoiceInitial(invoice: { label: string, date: moment.Moment }) {
    console.log("FATURA INICIAL");
    this.selectedInvoice = invoice.label;

    console.log("this.selectedInvoice", this.selectedInvoice);


    this.transacaoForm.patchValue({ mes_fatura: invoice.date.format('YYYY-MM-DD') }); // Define o campo mes_fatura para SQLite
  }

  async selectCard(card: Card) {
    this.selectedCard = card.nome;
    this.transacaoForm.patchValue({ cartao_id: card.cartao_id });
    this.generateInvoiceOptions(card); // Gera opções de fatura para o cartão selecionado
    await this.modalController.dismiss();
  }

  async selectCategory(category: Category) {
    this.selectedCategory = category.nome;
    this.transacaoForm.patchValue({ categoria_id: category.id }); // Atualiza o valor do ícone no formulário
    await this.modalController.dismiss(); // Fecha o modal
  }

  async selectInvoice(invoice: { label: string, date: moment.Moment }) {
    this.selectedInvoice = invoice.label;
    this.transacaoForm.patchValue({ mes_fatura: invoice.date.format('YYYY-MM-DD') }); // Define o campo mes_fatura para SQLite
    await this.modalController.dismiss();
  }


  generateInvoiceOptions(card: Card) {
    const dayDue = card.dia_fechamento; // Dia de vencimento do cartão

    // Calcula o mês anterior, considerando o dia de vencimento
    const previousMonthInvoice = moment().subtract(1, 'months').date(dayDue);

    // Próximos três meses, considerando o dia de vencimento
    const nextMonthsInvoices = [0, 1, 2, 3].map(i => moment().add(i, 'months').date(dayDue));

    // Limpa faturas antigas antes de adicionar novas
    this.invoices = [];

    // Adiciona o mês anterior à lista de faturas
    this.invoices.push({
      label: `Fatura ${dayDue.toString().padStart(2, '0')} ${previousMonthInvoice.format('MMM YYYY')}`,
      date: previousMonthInvoice
    });

    // Adiciona os próximos três meses à lista de faturas
    nextMonthsInvoices.forEach(month => {
      this.invoices.push({
        label: `Fatura ${dayDue.toString().padStart(2, '0')} ${month.format('MMM YYYY')}`,
        date: month
      });
    });
  }

  submitTransacao() {
    if (this.transacaoForm.invalid) {
      // Marca todos os campos como tocados para exibir a validação
      this.transacaoForm.markAllAsTouched();
      return;
    }

    const isParcelado = this.transacaoForm.value.is_parcelado;

    if (this.transacaoForm.valid) {
      const formData = this.transacaoForm.value;
      const transacao_id = this.despesa?.transacao_id;

      // Formatação dos dados da transação
      const transacao = {
        descricao: formData.descricao,
        conta_id: formData.conta_id || null,
        cartao_id: formData.cartao_id || null,
        categoria_id: formData.categoria_id,
        tipo: formData.tipo,  // "despesa" ou "receita", deve estar no formulário
        data_transacao: moment(formData.data).format('YYYY-MM-DD'), // Formato para data de transação
        valor: parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.')),
        status: formData.status, // Status padrão, como 'pendente'
        is_parcelado: formData.is_parcelado,
        num_parcelas: formData.num_parcelas || null,
        valor_parcela: isParcelado ? formData.valor_parcela : null,
        is_recorrente: formData.is_recorrente,
        quantidade_repetir: formData.quantidade_repetir || null,
        periodo: formData.periodo || null,
        fk_parcelas_parcela_id: formData.fk_parcelas_parcela_id || null,
        mes_fatura: moment(formData.mes_fatura).format('YYYY-MM-DD') || null
      };

      // Chama o serviço para atualizar a transação no banco de dados
      this.transactionService.updateTransaction(
        transacao_id!,
        transacao.conta_id,
        transacao.cartao_id,
        transacao.categoria_id,
        transacao.tipo,
        transacao.valor,
        transacao.descricao,
        transacao.is_parcelado,
        transacao.num_parcelas,
        transacao.valor_parcela,
        transacao.is_recorrente,
        transacao.quantidade_repetir,
        transacao.periodo,
        transacao.status,
        transacao.fk_parcelas_parcela_id,
        transacao.data_transacao,
        transacao.mes_fatura
      )
        .then(async () => {
          console.log('Transação editada com sucesso');
          await this.presentToast('Transação editada com sucesso!', 'light');
          this.modalController.dismiss({ transacao: this.transacaoForm });
          this.transacaoForm.reset(); // Reseta o formulário após o sucesso
        })
        .catch(error => {
          console.error('Erro ao editar transação:', error);
        });
    } else {
      console.log('Formulário inválido');
    }
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


  handleInstallmentToggle($event: any) {
    this.myValue = !this.myValue;

    if (this.myValue) {
      this.generateInstallments();
      this.transacaoForm.patchValue({ is_parcelado: true });
      this.isModalOpen = true;
    } else {
      this.selectedInstallment = undefined
      this.transacaoForm.patchValue({ is_parcelado: false });
      this.isModalOpen = false;
      this.transacaoForm.patchValue({ num_parcelas: null });
      this.transacaoForm.patchValue({ valor_parcela: null });
    }
  }

  generateInstallments() {
    const formData = this.transacaoForm.value;

    // Verifica se há um valor no input e o converte para número
    const numParcelas = this.customInstallmentCount ? Number(this.customInstallmentCount) : 0;
    const totalValue = parseFloat(formData.valor?.toString().replace(/[^\d,]/g, '').replace(',', '.')) || 0;

    if (numParcelas > 0) {
      // Gera apenas a parcela digitada
      this.singleInstallment = {
        label: `${numParcelas}x de R$ ${(totalValue / numParcelas).toFixed(2)}`,
        value: totalValue / numParcelas,
        quantidade_parcelas: numParcelas
      };
      this.installments = []; // Esconde a lista padrão
    } else {
      // Caso contrário, mostra a lista padrão de 12 parcelas
      this.singleInstallment = null;
      this.installments = Array.from({ length: 12 }, (_, i) => {
        const numParcelas = i + 1;
        return {
          label: `${numParcelas}x de R$ ${(totalValue / numParcelas).toFixed(2)}`,
          value: totalValue / numParcelas,
          quantidade_parcelas: numParcelas
        };
      });
    }
  }


  selectedInstallment: { label: string; value: number; quantidade_parcelas: number; } | undefined;
  selectInstallment(installment: { label: string; value: number; quantidade_parcelas: number; }) {
    this.selectedInstallment = installment;
    this.transacaoForm.patchValue({ num_parcelas: installment.quantidade_parcelas });
    this.transacaoForm.patchValue({ valor_parcela: installment.value });
    console.log('Parcela selecionada:', installment);
  }

  closeModal() {
    if (this.selectedInstallment === undefined) {
      this.myValue = !this.myValue;
      this.transacaoForm.patchValue({ is_parcelado: false });
      this.isModalOpen = false;
    }

    this.isModalOpen = false;
  }
}
