import { Component, OnInit, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
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
  mesSelecionado!: number;
  saldo: number = 0.00;
  receita: number = 0.00;
  despesa: number = 0.00;
  mostrarValores = true; // Estado inicial: mostrar valores

  despesasFiltradas: Transacao[] = [];
  receitasFiltradas: Transacao[] = [];

  valorAtual: number = 0;
  valorFinal: number = 0; // O valor final desejado

  mesesCompletos: string[] = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  mesesAbreviados: string[] = [
    'JAN.', 'FEV.', 'MAR.', 'ABR.', 'MAI.', 'JUN.',
    'JUL.', 'AGO.', 'SET.', 'OUT.', 'NOV.', 'DEZ.'
  ];
  nomeMes: string = '';
  meses: any;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private transactionService: TransactionsService,
    private changeDetectorRef: ChangeDetectorRef // Importando ChangeDetectorRef
  ) {}

  ngOnInit() {
    const now = moment();
    this.mesSelecionado = now.month(); // Inicializa com o mês atual
    this.nomeMes = this.mesesCompletos[this.mesSelecionado]; // Nome completo do mês atual

    this.atualizarSaldo();

    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (this.mostrarDatePicker && !this.elRef.nativeElement.contains(event.target)) {
        this.toggleDatePicker();
      }
    });
  }

  toggleValores(): void {
    this.mostrarValores = !this.mostrarValores;
  }

  toggleDatePicker() {
    this.mostrarDatePicker = !this.mostrarDatePicker;
  }

  mudarAno(valor: number) {
    this.anoSelecionado += valor;
    this.atualizarSaldo();
  }
  
  handleRefresh(event: any) {
    this.atualizarSaldo().then(() => {
      event.target.complete(); // Finaliza o loading do refresher
    });
  }
  
  selecionarMes(indice: number) {
    this.mesSelecionado = indice;
    this.nomeMes = this.mesesCompletos[indice]; // Use os meses completos aqui
    console.log(`Mês selecionado: ${this.nomeMes} de ${this.anoSelecionado}`);
    this.atualizarSaldo();
    this.toggleDatePicker();
  }

  mesAtual() {
    const now = moment();
    this.mesSelecionado = now.month();
    this.nomeMes = this.mesesCompletos[this.mesSelecionado]; // Use meses completos
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
  
    // Obtém o novo valor final e inicia a animação
    this.valorFinal = this.calcularDiferencaSaldo();
    this.animarValorSaldo(this.valorFinal);
  }

  animarValorSaldo(valorFinal: number) {
    const duracao = 1000; // Duração da animação em milissegundos
    const intervalo = 10; // Intervalo entre atualizações
    const passos = duracao / intervalo;
    const diferenca = valorFinal - this.valorAtual;
    const incremento = diferenca / passos;
    
    let passoAtual = 0;
  
    const animacao = setInterval(() => {
      this.valorAtual += incremento;
      this.changeDetectorRef.detectChanges(); // Atualiza a view manualmente
  
      passoAtual++;
      if (passoAtual >= passos) {
        this.valorAtual = valorFinal; // Garante que o valor final seja exato
        clearInterval(animacao);
      }
    }, intervalo);
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
