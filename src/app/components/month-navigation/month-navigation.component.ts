import { Component, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-month-navigation',
  templateUrl: './month-navigation.component.html',
  styleUrls: ['./month-navigation.component.scss'],
})
export class MonthNavigationComponent {
  // Initialize with the current month
  currentMonth = moment(); // Mês atual
  
  // Evento para emitir o mês selecionado
  @Output() monthChanged = new EventEmitter<string>();

  // Getters for month labels
  get selectedMonthLabel() {
    return this.currentMonth.format('MMM/YY'); // Example: 'set/24'
  }

  get prevMonthLabel() {
    return this.currentMonth.clone().subtract(1, 'months').format('MMM/YY');
  }

  get nextMonthLabel() {
    return this.currentMonth.clone().add(1, 'months').format('MMM/YY');
  }

  private emitCurrentMonth() {
    this.monthChanged.emit(this.currentMonth.format('YYYY-MM')); // Exemplo: '2024-09'
  }

  // Navigate to the previous month (button click)
  prevMonth() {
    this.currentMonth = this.currentMonth.subtract(1, 'months');
    this.emitCurrentMonth(); // Emite o mês atualizado
  }

  // Navigate to the next month (button click)
  nextMonth() {
    this.currentMonth = this.currentMonth.add(1, 'months');
    this.emitCurrentMonth(); // Emite o mês atualizado
  }

  // Select previous month label click
  selectPrevMonth() {
    this.prevMonth(); // Reuse the prevMonth method
  }

  // Select next month label click
  selectNextMonth() {
    this.nextMonth(); // Reuse the nextMonth method
  }
}
