import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddCardComponent } from '../../card/add-card/add-card.component';
import { DatabaseService } from 'src/app/services/database.service';
import { AccountService } from 'src/app/services/account/account.service';
import { BankService } from 'src/app/services/bank/bank.service';
import { Card } from 'src/app/models/card.model';
import { CardService } from 'src/app/services/card/card.service';

@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.component.html',
  styleUrls: ['./wallets.component.scss'],
})
export class WalletsComponent  implements OnInit {
  databaseService = inject(DatabaseService)
  cardService = inject(CardService)
  bankService = inject(BankService)

  cards: Card[] = []; // Altere para o tipo apropriado se necessário

  constructor(
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    await this.databaseService.createDatabaseConnection();
    this.getCards();
  }

  async addCard() {
    const modal = await this.modalCtrl.create({
      component: AddCardComponent
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.getCards(); // Recarrega as Contas após adicionar uma nova
      }
    });

    return await modal.present();
  }

  async getCards() {
    try {
      // Chama o método do serviço para buscar as contas
      this.cards = await this.cardService.getCards();
      console.log('Contas carregadas:', JSON.stringify(this.cards));
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    }
  }
}
