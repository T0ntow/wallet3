import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/pt-br';  // Importa o locale para português
import { Account } from 'src/app/models/account.model';
import { Category } from 'src/app/models/category.model';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';
import { AccountService } from 'src/app/services/account/account.service';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';
@Component({
  selector: 'app-add-card-expense',
  templateUrl: './add-card-expense.component.html',
  styleUrls: ['./add-card-expense.component.scss'],
})
export class AddCardExpenseComponent implements OnInit {
  transacaoForm: FormGroup;
  selectedAccount: string = '';
  selectedCategory: string = '';
  selectedInvoice: string = '';
 
  // Fatura mes
  invoices: { label: string, date: moment.Moment }[] = [];

  //toggle parcelado
  parcelado: boolean = false; // Estado para controle de "parcelado"

  //Categorias
  categories: Category[] = [];
  accounts: Account[] = [];

  categoryLoaderService = inject(CategoryLoaderService)
  accountService = inject(AccountService)
  transactionService = inject(TransactionsService)

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.transacaoForm = this.formBuilder.group({
      descricao: ['', Validators.required],
      conta_id: [null],
      categoria_id: [null, Validators.required],
      data: ['', Validators.required],
      valor: ['', Validators.required],
      status: ['pago', Validators.required],
      tipo: ['despesa'],
      is_parcelado: [false],
      num_parcelas: [null],
      is_recorrente: [false],
      quantidade_repetir: [null],
      periodo: [null]
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
      this.accounts = await this.accountService.getAccounts();
      this.generateInvoiceOptions();
    } catch (error) {
      console.error('Error loading categories or accounts:', error);
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async selectAccount(account: Account) {
    this.selectedAccount = account.nome;
    this.transacaoForm.patchValue({ conta_id: account.conta_id }); // Atualiza o valor do ícone no formulário
    await this.modalController.dismiss(); // Fecha o modal
  }

  async selectCategory(category: Category) {
    this.selectedCategory = category.nome;
    this.transacaoForm.patchValue({ categoria_id: category.id }); // Atualiza o valor do ícone no formulário
    await this.modalController.dismiss(); // Fecha o modal
  }


  selectInvoice(invoice: string) {
    this.selectedInvoice = invoice;
    // this.closeSheet();
    console.log('Fatura selecionada:', invoice);
  }


  toggleParcelado(event: any) {
    this.parcelado = event.detail.checked;
    console.log('Parcelado:', this.parcelado);
  }


  generateInvoiceOptions() {
    const currentDate = moment(); // Data atual

    // Mês anterior ao atual
    const previousMonth = moment().subtract(1, 'months');
    // Próximos três meses
    const nextMonths = [0, 1, 2, 3].map(i => moment().add(i, 'months'));

    // Adicionar o mês anterior à lista
    this.invoices.push({
      label: `Fatura 01 ${previousMonth.format('MMM YYYY')}`,
      date: previousMonth
    });

    // Adicionar os próximos três meses à lista
    nextMonths.forEach(month => {
      this.invoices.push({
        label: `Fatura 01 ${month.format('MMM YYYY')}`,
        date: month
      });
    });
  }


  submitAccount() {
    if (this.transacaoForm.valid) {
      const formData = this.transacaoForm.value;
      console.log('Form Data:', formData);
      // Lógica para envio de dados
    }
  }

}
