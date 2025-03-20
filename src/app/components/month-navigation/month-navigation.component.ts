import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, Renderer2 } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-month-navigation',
  templateUrl: './month-navigation.component.html',
  styleUrls: ['./month-navigation.component.scss'],
})
export class MonthNavigationComponent {
  currentMonth = moment(); // Mês atual
  mesSelecionado!: number;

  mostrarDatePicker: boolean = false;
  anoSelecionado: number = moment().year();
  mesesCompletos: string[] = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  mesesAbreviados: string[] = [
    'JAN.', 'FEV.', 'MAR.', 'ABR.', 'MAI.', 'JUN.',
    'JUL.', 'AGO.', 'SET.', 'OUT.', 'NOV.', 'DEZ.'
  ];
  meses: any;
  @Output() monthChanged = new EventEmitter<string>();
  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    const now = moment();
    this.mesSelecionado = now.month(); // Inicializa com o mês atual

    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (this.mostrarDatePicker && !this.elRef.nativeElement.contains(event.target)) {
        this.toggleDatePicker();
      }
    });
  }

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
    this.currentMonth = this.currentMonth.subtract(1, 'months');  // Subtrai um mês do currentMonth
    this.mesSelecionado = this.currentMonth.month();  // Obtém o índice do mês após a subtração
    this.anoSelecionado = this.currentMonth.year();  // Obtém o índice do mês após a subtração
    this.emitCurrentMonth();  // Emite o mês atualizado
  }

  // Navigate to the next month (button click)
  nextMonth() {
    this.currentMonth = this.currentMonth.add(1, 'months');
    this.mesSelecionado = this.currentMonth.month();  // Obtém o índice do mês após a subtração
    this.anoSelecionado = this.currentMonth.year();  // Obtém o índice do mês após a subtração
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

  toggleDatePicker() {
    this.mostrarDatePicker = !this.mostrarDatePicker;
  }

  mudarAno(valor: number) {
    this.anoSelecionado += valor;
  }

  selecionarMes(indice: number) {
    this.mesSelecionado = indice;
    this.currentMonth = moment().year(this.anoSelecionado).month(indice); // Atualiza o mês selecionado
    this.monthChanged.emit(this.currentMonth.format('YYYY-MM')); // Emite o evento corretamente
    this.toggleDatePicker();
  }

  mesAtual() {
    const now = moment();
    this.mesSelecionado = now.month();  // Atualiza o índice do mês selecionado
    this.anoSelecionado = now.year();  // Atualiza o ano selecionado

    this.currentMonth = now;  // Atualiza o momento com o mês atual
    this.monthChanged.emit(this.currentMonth.format('YYYY-MM')); // Emite o evento corretamente

    this.toggleDatePicker();  // Alterna o date picker
  }


  cancelar() {
    this.toggleDatePicker();
    console.log('Seleção de data cancelada');
  }
}
