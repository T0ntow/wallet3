import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Chart, ChartOptions, registerables } from 'chart.js';
import { Category } from 'src/app/models/category.model';
import { Transacao } from 'src/app/models/transaction.model';

@Component({
  selector: 'app-charts-receive',
  templateUrl: './charts-receive.component.html',
  styleUrls: ['./charts-receive.component.scss'],
})
export class ChartsReceiveComponent  implements OnInit {
  @Input() receitas: Transacao[] = []; // Recebe as despesas do componente pai
  @Input() categorias: Category[] = []; // Recebe as categorias do componente pai

  private chart: Chart | null = null; // Armazena a instância do gráfico
  private exibirPendentes: boolean = false; // Alterna entre Total Gasto e Gasto Pendente
  isMinimized: boolean = false; // Controla o estado do card (minimizado ou visível)

  constructor() {
    Chart.register(...registerables); // Registra os componentes necessários do Chart.js
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receitas'] || changes['categorias']) {
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

  ngOnInit() {}

  private createChart(): void {
    // Verifica se há dados suficientes para gerar o gráfico
    if (!this.categorias || !this.receitas) {
      console.warn('Categorias ou receitas não foram carregadas corretamente.');
      return;
    }
  
    // Filtra categorias que possuem receitas
    const categoriasComReceitas = this.categorias.filter(categoria =>
      this.receitas.some(receita => receita.categoria_id === categoria.id)
    );
  
    // Calcula os valores totais para cada categoria
    const valoresReceitas = categoriasComReceitas.map(categoria =>
      this.receitas
        .filter(receita => receita.categoria_id === categoria.id) // Apenas receitas da categoria atual
        .reduce((total, receita) => total + (receita.valor || 0), 0) // Soma os valores das receitas
    );
  
    // Filtra categorias e valores onde o total de receitas é maior que zero
    const categoriasFiltradas = categoriasComReceitas.filter((_, index) => valoresReceitas[index] > 0);
    const valoresFiltrados = valoresReceitas.filter(valor => valor > 0);
    const rotulos = categoriasFiltradas.map(categoria => categoria.nome);
  
    // Configuração de cores do gráfico
    const corBarra = '#6db6dbab';
    const corBorda = '#36b4d4';
  
    // Obtém o contexto do canvas
    const canvas = document.getElementById('chartCanvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas "chartCanvas" não encontrado.');
      return;
    }
  
    const chartContext = canvas.getContext('2d');
    if (!chartContext) {
      console.error('Não foi possível obter o contexto 2D do canvas.');
      return;
    }
  
    // Destroi o gráfico anterior, se existir
    if (this.chart) {
      this.chart.destroy();
    }
  
    // Cria o novo gráfico
    this.chart = new Chart(chartContext, {
      type: 'bar',
      data: {
        labels: rotulos,
        datasets: [
          {
            label: 'Receitas',
            data: valoresFiltrados,
            backgroundColor: corBarra,
            borderColor: corBorda,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      } as ChartOptions<'bar'>,
    });
  }
  
  
}
