import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { faUtensils, faBus, faHeartbeat, faGraduationCap, faFutbol, faShoppingCart, faHome, faLightbulb, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})
export class AddExpenseComponent  implements OnInit {
  accountForm: FormGroup;
  selectedAccount: string = '';
  selectedCategory: string = '';
  isCategoriesSheetVisible: boolean = false;
  isAccountSheetVisible: boolean = false;

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

  // toogle repetir
  recorrente: boolean = false; // Estado para controle de "recorrente"
  periodo: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.accountForm = this.formBuilder.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      amount: ['', Validators.required],
      quantity: ['', Validators.required],
      period: [this.periodo, Validators.required],
    });
  }

  @ViewChild('popover') popover: { event: Event; } | undefined;

  isOpen = false;

  presentPopover(e: Event) {
    this.popover!.event = e;
    this.isOpen = true;
  }
  
  ngOnInit() {}

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

  selectPeriod(period: string) {
    this.periodo = period;
  }

  toggleRecorrente(event: any) {
    this.recorrente = event.detail.checked;
    console.log('Recorrente:', this.recorrente);
  }


  toggleSheet(sheet: string) {
    if (sheet === 'account') {
      this.isAccountSheetVisible = !this.isAccountSheetVisible;
      this.isCategoriesSheetVisible = false;  // Fechar o sheet de categorias
    } else if (sheet === 'category') {
      this.isCategoriesSheetVisible = !this.isCategoriesSheetVisible;
      this.isAccountSheetVisible = false;    // Fechar o sheet de contas
    }
  }
  

  closeSheet() {
    this.isCategoriesSheetVisible = false;
    this.isAccountSheetVisible = false;
  }



  submitAccount() {
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      console.log('Form Data:', formData);
      // Lógica para envio de dados
    }
  }

}
