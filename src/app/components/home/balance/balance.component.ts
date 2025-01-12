import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import * as moment from 'moment';
import { Transacao } from 'src/app/models/transaction.model';
import { BalanceService } from 'src/app/services/balance/balance.service';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss'],
})
export class BalanceComponent implements OnInit {
  mostrarDatePicker: boolean = false;
  anoSelecionado: number = moment().year();
  mesSelecionado: number | null = null;
  saldo: number = 0.00;
  receita: number = 0.00;
  despesa: number = 0.00;

  despesasFiltradas: Transacao[] = [];
  receitasFiltradas: Transacao[] = [];

  meses: string[] = [
    'JAN.', 'FEV.', 'MAR.', 'ABR.', 'MAI.', 'JUN.',
    'JUL.', 'AGO.', 'SET.', 'OUT.', 'NOV.', 'DEZ.'
  ];
  nomeMes: string = this.meses[moment().month()];

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private transactionService: TransactionsService
  ) {}

  ngOnInit() {
    this.atualizarSaldo();

    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (this.mostrarDatePicker && !this.elRef.nativeElement.contains(event.target)) {
        this.toggleDatePicker();
      }
    });
  }

  toggleDatePicker() {
    this.mostrarDatePicker = !this.mostrarDatePicker;
  }

  mudarAno(valor: number) {
    this.anoSelecionado += valor;
    this.atualizarSaldo();
  }

  selecionarMes(indice: number) {
    this.mesSelecionado = indice;
    this.nomeMes = this.meses[indice];
    console.log(`Mês selecionado: ${this.nomeMes} de ${this.anoSelecionado}`);
    this.atualizarSaldo();
    this.toggleDatePicker();
  }

  mesAtual() {
    const now = moment();
    this.mesSelecionado = now.month();
    this.nomeMes = this.meses[this.mesSelecionado];
    this.anoSelecionado = now.year();
    console.log(`Mês atual selecionado: ${this.nomeMes} de ${this.anoSelecionado}`);
    this.atualizarSaldo();
    this.toggleDatePicker();
  }

  cancelar() {
    this.toggleDatePicker();
    console.log('Seleção de data cancelada');
  }

  async atualizarSaldo() {
    const mesSelecionado = this.mesSelecionado !== null 
      ? moment().year(this.anoSelecionado).month(this.mesSelecionado).startOf('month')
      : moment().startOf('month');
    
    const month = mesSelecionado.format('YYYY-MM');
    console.log(`Atualizando saldo para: ${month}`);

    await this.updateTransactionsByMonth(month);
  }

  async updateTransactionsByMonth(month: string) {
    const despesas = await this.transactionService.getAllTransactions();
    const despesasCartao = await this.transactionService.getDespesasCartaoByMonth(month);
    const despesasConta = await this.transactionService.getDespesasContaByMonth(month);
    const receitas = await this.transactionService.getReceitasByMonth(month);

    const installmentsResult = await this.transactionService.getParcelasByMonth(month);

    const mappedInstallments = installmentsResult.map(installment => {
      const associatedExpense = despesas.find(transaction => transaction.transacao_id === installment.transacao_id);
      return {
        ...installment,
        ...associatedExpense,
      };
    });

    this.despesasFiltradas = [...despesasCartao, ...despesasConta, ...mappedInstallments];
    this.receitasFiltradas = [...receitas];
  }

  calcularDiferencaSaldo(): number {
    return this.calcularTotalReceitas() - this.calcularTotalDespesas();
  }

  calcularTotalDespesas(): number {
    return this.despesasFiltradas.reduce((total, despesa) => {
      return total + (Number(despesa.valor) || 0) + (Number(despesa.valor_parcela) || 0);
    }, 0);
  }

  calcularTotalReceitas(): number {
    return this.receitasFiltradas.reduce((total, receita) => {
      return total + (Number(receita.valor) || 0);
    }, 0);
  }
}
