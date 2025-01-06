import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlName, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionsPageRoutingModule } from './transactions-routing.module';

import { TransactionsPage } from './transactions.page';
import { MonthNavigationComponent } from 'src/app/components/month-navigation/month-navigation.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditExpenseComponent } from 'src/app/components/expenses/edit-expense/edit-expense.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EditCardExpenseComponent } from 'src/app/components/card-expenses/edit-card-expense/edit-card-expense.component';
import { ChartsComponent } from 'src/app/components/charts/charts.component';
import { AddReceiveComponent } from 'src/app/components/receives/add-receive/add-receive.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionsPageRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  declarations: [
    TransactionsPage,
    MonthNavigationComponent,
    EditExpenseComponent,
    EditCardExpenseComponent,
    ChartsComponent,
    AddReceiveComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransactionsPageModule {}
