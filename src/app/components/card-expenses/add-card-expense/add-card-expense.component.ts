import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { IonToggle, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/pt-br';  // Importa o locale para português
import { Category } from 'src/app/models/category.model';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';
import { Card } from 'src/app/models/card.model';
import { CardService } from 'src/app/services/card/card.service';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { maskitoPrice } from '../../../mask';
import { MaskitoElementPredicate } from '@maskito/core';

@Component({
  selector: 'app-add-card-expense',
  templateUrl: './add-card-expense.component.html',
  styleUrls: ['./add-card-expense.component.scss'],
})
export class AddCardExpenseComponent implements OnInit {
  transacaoForm: FormGroup;
  selectedCategory: string = '';
  selectedInvoice: string = '';

  // Fatura mes
  invoices: { label: string, date: moment.Moment }[] = [];

  //toggle parcelado
  parcelado: boolean = false; // Estado para controle de "parcelado"
  isParcelado: boolean = true;

  //Categorias
  categories: Category[] = [];
  cards: Card[] = [];

  categoryLoaderService = inject(CategoryLoaderService)
  cardService = inject(CardService)
  transactionService = inject(TransactionsService)
  toastController = inject(ToastController)

  selectedCard: string = '';
  selectedCardLogo: string | undefined;
  selectedCategoryIcon: IconDefinition | undefined;
  readonly maskitoPrice = maskitoPrice;
  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();

  isModalOpen = false;
  installments: { label: string; value: number; quantidade_parcelas: number; }[] | undefined;

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

  isOpen = false;
  presentPopover(e: Event) {
    this.popover!.event = e;
    this.isOpen = true;
  }

  async ngOnInit() {
    try {
      this.categories = await this.categoryLoaderService.loadCategoriesByExpenses();
      this.cards = await this.cardService.getCards();

      // Inicializar Cartão
      if (this.cards.length > 0) {
        const firstAccount = this.cards[0];
        this.selectedCard = firstAccount.nome;// Atualiza o nome da conta selecionada
        this.selectedCardLogo = firstAccount.logo_url;

        this.transacaoForm.patchValue({ cartao_id: firstAccount.cartao_id });
        this.generateInvoiceOptions(firstAccount); // Gera opções de fatura para o cartão selecionado
      }

      // Inicializar Categoria
      if (this.categories.length > 0) {
        const firstCategory = this.categories[0];
        this.selectedCategory = firstCategory.nome;// Atualiza o nome da conta selecionada
        this.selectedCategoryIcon = firstCategory.icone;

        this.transacaoForm.patchValue({ categoria_id: firstCategory.id });
      }

      // Inicializar Fatura
      if (this.invoices.length > 0) {
        const firstInvoice = this.invoices[2];
        this.selectedInvoice = firstInvoice.label;
        this.transacaoForm.patchValue({ mes_fatura: firstInvoice.date.format('YYYY-MM-DD') }); // Define o campo mes_fatura para SQLite
      }

      // Inicializar Data
      this.transacaoForm.patchValue({ data: moment().format('YYYY-MM-DD') });
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

  async selectCard(card: Card) {
    this.selectedCard = card.nome;
    this.selectedCardLogo = card.logo_url;
    this.transacaoForm.patchValue({ cartao_id: card.cartao_id });
    this.generateInvoiceOptions(card); // Gera opções de fatura para o cartão selecionado
    await this.modalController.dismiss();
  }

  async selectCategory(category: Category) {
    this.selectedCategory = category.nome;
    this.selectedCategoryIcon = category.icone;
    this.transacaoForm.patchValue({ categoria_id: category.id }); // Atualiza o valor do ícone no formulário
    await this.modalController.dismiss(); // Fecha o modal
  }

  async selectInvoice(invoice: { label: string, date: moment.Moment }) {
    this.selectedInvoice = invoice.label;
    this.transacaoForm.patchValue({ mes_fatura: invoice.date.format('YYYY-MM-DD') }); // Define o campo mes_fatura para SQLite
    console.log('Fatura selecionada:', invoice.label);
    await this.modalController.dismiss();
  }

  generateInvoiceOptions(card: Card) {
    const dayDue = card.dia_fechamento; // Dia de vencimento do cartão
    const currentDate = moment();

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
    const isParcelado = this.transacaoForm.value.is_parcelado;

    if (this.transacaoForm.invalid) {
      // Marca todos os campos como tocados para exibir a validação
      this.transacaoForm.markAllAsTouched();
      return;
    }

    if (this.transacaoForm.valid) {
      const formData = this.transacaoForm.value;

      // Formatação dos dados
      const transacao = {
        descricao: formData.descricao,
        conta_id: formData.conta_id || null,
        cartao_id: formData.cartao_id || null,
        categoria_id: formData.categoria_id,
        tipo: formData.tipo,  // "despesa" ou "receita", deve ser parte do seu formulário
        // Formatação da data usando moment
        data: moment(formData.data).format('YYYY-MM-DD'), // Formato desejado
        valor: parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.')),
        status: formData.status,  // Adicionando status, padrão como 'pendente'
        is_parcelado: formData.is_parcelado,
        num_parcelas: formData.num_parcelas || null,
        is_recorrente: formData.is_recorrente,
        quantidade_repetir: formData.quantidade_repetir || null,
        periodo: formData.periodo || null,
        fk_parcelas_parcela_id: formData.fk_parcelas_parcela_id || null, // Caso aplicável
        valor_parcela: isParcelado ? formData.valor_parcela : null,
        mes_fatura: moment(formData.mes_fatura).format('YYYY-MM-DD') || null
      };

      console.log("transacao", JSON.stringify(transacao));

      // Chama o serviço para salvar a transação no banco de dados
      this.transactionService.addTransaction(
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
        transacao.status, // Enviando status para o método
        transacao.fk_parcelas_parcela_id,
        transacao.data, // Enviando data formatada
        transacao.mes_fatura
      )
        .then(async () => {
          console.log('Transação adicionada com sucesso');
          await this.presentToast('Transação adicionada com sucesso!', 'light');
          this.modalController.dismiss({ transacao: this.transacaoForm });

          this.transacaoForm.reset(); // Reseta o formulário
        })
        .catch(error => {
          console.error('Erro ao adicionar transação:', error);
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

  installmentCount = 12; // Valor inicial padrão
  customInstallmentCount: number | null = null;
  singleInstallment: any | null = null; // Para exibir apenas a parcela digitada

  myValue: boolean = false;
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
