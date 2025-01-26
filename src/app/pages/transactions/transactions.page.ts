import { Component, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  currentMonth = moment(); // Inicializa com o mês atual
  mostrarViewPicker: boolean = false;
  selectedView: string = 'Despesas'; // Valor padrão

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
  ) { }

  async ngOnInit() {

    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (this.mostrarViewPicker && !this.elRef.nativeElement.contains(event.target)) {
        this.toggleView();
      }
    });
  }

  // Método chamado quando o mês é alterado
  updateTransactionsByMonth(month: string) {
    this.currentMonth = moment(month, 'YYYY-MM');
    console.log('Mês atualizado:', JSON.stringify(this.currentMonth));
  }

  toggleView() {
    this.mostrarViewPicker = !this.mostrarViewPicker;
  }

  cancelar() {
    this.mostrarViewPicker = false;
  }

  selectView(view: string) {
    this.selectedView = view
    this.mostrarViewPicker = !this.mostrarViewPicker;
  }
}
