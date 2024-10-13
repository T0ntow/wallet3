import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddAccountComponent } from '../../account-components/add-account/add-account.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent  implements OnInit {

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  async addAccount() {
    const modal = await this.modalCtrl.create({
      component: AddAccountComponent,
    });
    modal.present();
  }
}
