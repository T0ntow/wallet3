import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { HeaderComponent } from 'src/app/components/home/header/header.component';
import { BalanceComponent } from 'src/app/components/home/balance/balance.component';
import { WalletsComponent } from 'src/app/components/home/wallets/wallets.component';
import { AccountsComponent } from 'src/app/components/home/accounts/accounts.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    HeaderComponent,
    BalanceComponent,
    WalletsComponent,
    AccountsComponent
  ]
})
export class HomePageModule {}
