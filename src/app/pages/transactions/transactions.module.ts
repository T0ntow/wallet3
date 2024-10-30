import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlName, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionsPageRoutingModule } from './transactions-routing.module';

import { TransactionsPage } from './transactions.page';
import { MonthNavigationComponent } from 'src/app/components/month-navigation/month-navigation.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionsPageRoutingModule,
    FontAwesomeModule
  ],
  declarations: [
    TransactionsPage,
    MonthNavigationComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Adicione esta linha
})
export class TransactionsPageModule {}
