import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddCardComponent } from '../../card/add-card/add-card.component';

@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.component.html',
  styleUrls: ['./wallets.component.scss'],
})
export class WalletsComponent  implements OnInit {

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}
  getIconUrl(bank: string): string {
    return `https://cdn.jsdelivr.net/npm/simple-icons/icons/${bank}.svg`;
  }
  
  async addCard() {
    const modal = await this.modalCtrl.create({
      component: AddCardComponent,
    });
    modal.present();
  }
}
