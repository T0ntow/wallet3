import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddExpenseComponent } from '../expenses-components/add-expense/add-expense.component';
import { AddCardExpenseComponent } from '../card-expenses/add-card-expense/add-card-expense.component';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  selectedTab: string = 'home'; // Define uma aba padrão
  isSheetVisible: boolean = false;
  modalCtrl = inject(ModalController)

  onTabChange(tab: string) {
    this.selectedTab = tab; // Atualiza a aba ativa
  }

  constructor() { }

  ngOnInit() { }

  toggleSheet() {
    this.isSheetVisible = !this.isSheetVisible; // Alterna a visibilidade do sheet
  }

  closeSheet() {
    this.isSheetVisible = false; // Fecha o sheet quando clicar fora
  }

  async addExpense() {
    const modal = await this.modalCtrl.create({
      component: AddExpenseComponent,
    });
    modal.present();
  }

  async addCardExpense() {
    const modal = await this.modalCtrl.create({
      component: AddCardExpenseComponent,
    });
    modal.present();
  }

}
