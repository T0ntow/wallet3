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
import { ChartsReceiveComponent } from 'src/app/components/charts-receive/charts-receive.component';
import { EditReceiveComponent } from 'src/app/components/receives/edit-receive/edit-receive.component';
import { ListExpensesComponent } from 'src/app/components/expenses/list-expenses/list-expenses.component';
import { ListReceivesComponent } from 'src/app/components/receives/list-receives/list-receives.component';
import { MaskitoDirective } from '@maskito/angular';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionsPageRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    MaskitoDirective,
  ],
  declarations: [
    TransactionsPage,
    MonthNavigationComponent,
    EditExpenseComponent,
    EditCardExpenseComponent,
    ChartsComponent,
    AddReceiveComponent,
    ChartsReceiveComponent,
    EditReceiveComponent,
    ListExpensesComponent,
    ListReceivesComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransactionsPageModule {}
