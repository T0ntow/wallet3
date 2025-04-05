import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { HeaderComponent } from 'src/app/components/home/header/header.component';
import { BalanceComponent } from 'src/app/components/home/balance/balance.component';
import { WalletsComponent } from 'src/app/components/home/wallets/wallets.component';
import { AccountsComponent } from 'src/app/components/home/accounts/accounts.component';
import { AddAccountComponent } from 'src/app/components/account/add-account/add-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AddCardComponent } from 'src/app/components/card/add-card/add-card.component';
import { CurrencyPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddExpenseComponent } from 'src/app/components/expenses/add-expense/add-expense.component';
import { AddCardExpenseComponent } from 'src/app/components/card-expenses/add-card-expense/add-card-expense.component';
import { MaskitoDirective } from '@maskito/angular';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MaskitoDirective
  ],
  declarations: [
    HomePage,
    HeaderComponent,
    BalanceComponent,
    WalletsComponent,
    AccountsComponent,
    AddAccountComponent,
    AddCardComponent,
    AddExpenseComponent,
    AddCardExpenseComponent,
  ],
  providers: [CurrencyPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],


})
export class HomePageModule {}
