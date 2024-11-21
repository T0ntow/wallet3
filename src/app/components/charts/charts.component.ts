import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartOptions, registerables } from 'chart.js';
import { Category } from 'src/app/models/category.model';
import { Transacao } from 'src/app/models/transaction.model';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
})
export class ChartsComponent implements OnChanges {
  @Input() despesas: Transacao[] = []; // Recebe as despesas do componente pai
  @Input() categorias: Category[] = []; // Recebe as categorias do componente pai

  private chart: Chart | null = null; // Armazena a instância do gráfico
  private exibirPendentes: boolean = false; // Alterna entre Total Gasto e Gasto Pendente
  isMinimized: boolean = false; // Controla o estado do card (minimizado ou visível)

  constructor() {
    Chart.register(...registerables); // Registra os componentes necessários do Chart.js
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['despesas'] || changes['categorias']) {
      this.createChart();
    }
  }

  toggleChart(event: any): void {
    this.exibirPendentes = event.detail.checked; // Atualiza o estado do toggle
    this.createChart(); // Recria o gráfico com os novos dados
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized; // Alterna o estado de minimização
  }

  private createChart() {
    // Filtrar categorias com despesas
    const categoriasComGastos = this.categorias.filter(categoria =>
      this.despesas.some(despesa => despesa.categoria_id === categoria.id)
    );
  
    // Preparar os dados para o gráfico com base no status
    const valores = categoriasComGastos.map(categoria =>
      this.despesas
        .filter(despesa =>
          despesa.categoria_id === categoria.id &&
          (this.exibirPendentes ? despesa.status === 'pendente' : despesa.status === 'pago')
        )
        .reduce((total, despesa) => total + (despesa.valor || 0) + (despesa.valor_parcela || 0), 0)
    );
  
    // Filtra as categorias e valores para exibir apenas as que têm valores maiores que zero (no caso de pendentes ou pagos)
    const categoriasFiltradas = categoriasComGastos.filter((categoria, index) => valores[index] > 0);
    const valoresFiltrados = valores.filter((valor) => valor > 0);
  
    // Rótulos (nomes das categorias) para o gráfico
    const rótulos = categoriasFiltradas.map(categoria => categoria.nome);
  
    // Definir as cores dinâmicas
    const corBarra = this.exibirPendentes ? '#db6d6dab' : '#e4c673ab';
    const corBorda = this.exibirPendentes ? '#d43636' : '#f8c537';
  
    const chartContext = (document.getElementById('chartCanvas') as HTMLCanvasElement).getContext('2d');
    if (!chartContext) {
      console.error('Erro ao obter o contexto do canvas.');
      return;
    }
  
    // Destroi o gráfico existente, se houver
    if (this.chart) {
      this.chart.destroy();
    }
  
    // Criar um novo gráfico
    this.chart = new Chart(chartContext, {
      type: 'bar', // Tipo de gráfico: barras
      data: {
        labels: rótulos, // Rótulos no eixo X
        datasets: [
          {
            label: this.exibirPendentes ? 'Gasto Pendente' : 'Total Gasto',
            data: valoresFiltrados, // Valores no eixo Y
            backgroundColor: corBarra, // Cor dinâmica da barra
            borderColor: corBorda, // Cor dinâmica da borda
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true },
          y: { beginAtZero: true },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      } as ChartOptions<'bar'>,
    });
  }
}
