import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddAccountComponent } from '../../account/add-account/add-account.component';
import { DatabaseService } from 'src/app/services/database.service';
import { AccountService } from 'src/app/services/account.service';
import { Account } from 'src/app/models/account.model';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})

export class AccountsComponent  implements OnInit {
  databaseService = inject(DatabaseService)
  accountService = inject(AccountService)
  accounts: Account[] = []; // Altere para o tipo apropriado se necessário

  constructor(
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    await this.databaseService.createDatabaseConnection();
    this.getAccounts();
  }

  async addAccount() {
    const modal = await this.modalCtrl.create({
      component: AddAccountComponent
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.getAccounts(); // Recarrega as Contas após adicionar uma nova
      }
    });

    return await modal.present();
  }

  async getAccounts() {
    try {
      // Chama o método do serviço para buscar as contas
      this.accounts = await this.accountService.getAccounts();
      console.log('Contas carregadas:', this.accounts);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    }
  }
}
