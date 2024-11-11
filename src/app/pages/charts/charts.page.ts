import { Component, inject, OnInit } from '@angular/core';
import { Chart, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';
import * as moment from 'moment';
import { Transacao } from 'src/app/models/transaction.model';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.page.html',
  styleUrls: ['./charts.page.scss'],
})
export class ChartsPage implements OnInit {
  currentMonth = moment(); // Inicializa com o mês atual
  despesasFiltradas: Transacao[] = []; // Array de despesas filtradas

  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: '',
      backgroundColor: '#2B307F',
      borderColor: '#2B307F',
      borderWidth: 1
    }]
  };
  
  transactionService = inject(TransactionsService);

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.updateTransactionsByMonth(this.currentMonth.format('YYYY-MM'));// Carrega o mês atual
  }

  async updateTransactionsByMonth(month: string) {
    this.currentMonth = moment(month); // Atualiza currentMonth com o novo mês

    // Obtém as despesas de cartão e conta
    const despesas = await this.transactionService.getAllTransactions();
    const despesasCartao = await this.transactionService.getDespesasCartaoByMonth(month);
    const despesasConta = await this.transactionService.getDespesasContaByMonth(month);

    // Obter parcelas pendentes para o mês
    const installmentsResult = await this.transactionService.getParcelasByMonth(month);

    // Mapeia as parcelas para incluir detalhes da despesa associada
    const mappedInstallments = installmentsResult.map(installment => {
      const associatedExpense = despesas.find(transaction => transaction.transacao_id === installment.transacao_id);

      // Extrair as informações da despesa associada
      const associatedExpenseData = associatedExpense ? {
        tipo: associatedExpense.tipo,
        descricao: associatedExpense.descricao,
        categoria_id: associatedExpense.categoria_id,
        cartao_id: associatedExpense.cartao_id,
        is_parcelado: associatedExpense.is_parcelado,
        num_parcelas: associatedExpense.num_parcelas,
        data_transacao: associatedExpense.data_transacao
      } : null;

      // Retornar a parcela com a despesa associada separada
      return {
        ...installment,
        ...associatedExpenseData // Inclui as propriedades diretamente no objeto da parcela
      };
    });

    // Combina despesas de cartão, conta e parcelas
    const despesasCompletas = [
      ...despesasCartao,
      ...despesasConta,
      ...mappedInstallments // Inclui as parcelas mapeadas dentro do mês
    ];

    // Agrupar despesas por categoria
    const despesasPorCategoria = despesasCompletas.reduce((acc, transacao) => {
      if (transacao.tipo === 'despesa') { // Apenas despesas para o gráfico
        if (!acc[transacao.categoria_id]) {
          acc[transacao.categoria_id] = 0;
        }
        acc[transacao.categoria_id] += transacao.valor;
      }
      return acc;
    }, {} as { [key: number]: number });

    // Estruturar os dados para o gráfico
    this.barChartData = {
      labels: Object.keys(despesasPorCategoria).map(catId => `Categoria ${catId}`),
      datasets: [
        {
          label: 'Despesas',
          data: Object.values(despesasPorCategoria),
          backgroundColor: '#FF6384',
          borderColor: '#FF6384',
          borderWidth: 1,
        }
      ]
    };

    this.despesasFiltradas = despesasCompletas;
  }



}
