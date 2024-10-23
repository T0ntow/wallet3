import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faUtensils, faBus, faHeartbeat, faGraduationCap, faFutbol, faShoppingCart, faHome, faLightbulb, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import 'moment/locale/pt-br';  // Importa o locale para português
@Component({
  selector: 'app-add-card-expense',
  templateUrl: './add-card-expense.component.html',
  styleUrls: ['./add-card-expense.component.scss'],
})
export class AddCardExpenseComponent  implements OnInit {

  accountForm: FormGroup;
  selectedAccount: string = '';
  selectedCategory: string = '';
  selectedInvoice: string = '';


  isCategoriesSheetVisible: boolean = false;
  isAccountSheetVisible: boolean = false;
  isInvoiceSheetVisible: boolean = false;

  // Fatura mes
  invoices: { label: string, date: moment.Moment }[] = [];

  //toggle parcelado
  parcelado: boolean = false; // Estado para controle de "parcelado"

  // Logos
  faUtensils = faUtensils;
  faBus = faBus;
  faHeartbeat = faHeartbeat;
  faGraduationCap = faGraduationCap;
  faFutbol = faFutbol;
  faShoppingCart = faShoppingCart;
  faHome = faHome;
  faLightbulb = faLightbulb;
  faEllipsisH = faEllipsisH;


  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.accountForm = this.formBuilder.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      amount: ['', Validators.required],
      quantity: ['', Validators.required],
      installmentValue: ['', Validators.required],
      installmentCount: ['', Validators.required],

    });
  }

  @ViewChild('popover') popover: { event: Event; } | undefined;

  isOpen = false;

  presentPopover(e: Event) {
    this.popover!.event = e;
    this.isOpen = true;
  }
  
  ngOnInit() {
    this.generateInvoiceOptions();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.closeSheet();
  }

  selectAccount(account: string) {
    this.selectedAccount = account;
    this.closeSheet();
  }

  selectInvoice(invoice: string) {
    this.selectedInvoice = invoice;
    this.closeSheet();
    console.log('Fatura selecionada:', invoice);
  }

  toggleSheet(sheet: string) {
    if (sheet === 'account') {
      this.isAccountSheetVisible = !this.isAccountSheetVisible;
      this.isCategoriesSheetVisible = false;  // Fechar o sheet de categorias
      this.isInvoiceSheetVisible = false;     // Fechar o sheet de faturas
    } else if (sheet === 'category') {
      this.isCategoriesSheetVisible = !this.isCategoriesSheetVisible;
      this.isAccountSheetVisible = false;     // Fechar o sheet de contas
      this.isInvoiceSheetVisible = false;     // Fechar o sheet de faturas
    } else if (sheet === 'invoice') {
      this.isInvoiceSheetVisible = !this.isInvoiceSheetVisible;
      this.isAccountSheetVisible = false;     // Fechar o sheet de contas
      this.isCategoriesSheetVisible = false;  // Fechar o sheet de categorias
    }
  }

  closeSheet() {
    this.isCategoriesSheetVisible = false;
    this.isAccountSheetVisible = false;
    this.isInvoiceSheetVisible = false;
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
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      console.log('Form Data:', formData);
      // Lógica para envio de dados
    }
  }

}
