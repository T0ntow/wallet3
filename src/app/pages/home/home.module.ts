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
import { AddAccountComponent } from 'src/app/components/account-components/add-account/add-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AddCardComponent } from 'src/app/components/card-components/add-card/add-card.component';
import { CurrencyPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  declarations: [
    HomePage,
    HeaderComponent,
    BalanceComponent,
    WalletsComponent,
    AccountsComponent,
    AddAccountComponent,
    AddCardComponent
  ],
  providers: [CurrencyPipe],
})
export class HomePageModule {}
