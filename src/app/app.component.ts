import { Component, inject } from '@angular/core';
import { CategoriesService } from './services/categories.service';
import { DatabaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  categoriesService = inject(CategoriesService)
  databaseService = inject(DatabaseService)

  constructor() {
    this.initializeApp();
  }

  async initializeApp() {
    await this.databaseService.createDatabaseConnection();
    await this.initializeCategories();
  }


  async initializeCategories() {
  const categories = await this.categoriesService.getCategories();
  if (categories.length === 0) {
    const defaultExpenseCategories = [
      { name: 'Alimentação', icon: 'utensils' },
      { name: 'Transporte', icon: 'bus' },
      { name: 'Saúde', icon: 'heart-pulse' },
      { name: 'Educação', icon: 'graduation-cap' },
      { name: 'Esportes', icon: 'futbol' },
      { name: 'Compras', icon: 'cart-shopping' },
      { name: 'Casa', icon: 'house' },
      { name: 'Energia', icon: 'lightbulb' },
      { name: 'Outros', icon: 'ellipsis-h' }
    ];

    const defaultIncomeCategories = [
      { name: 'Salário', icon: 'money-bill-wave' },
      { name: 'Freelancer', icon: 'briefcase' },
      { name: 'Investimentos', icon: 'piggy-bank' },
      { name: 'Vendas', icon: 'cart-shopping' },
      { name: 'Doações', icon: 'handshake-angle' }
    ];

    // Adicionando categorias de despesas
    for (const category of defaultExpenseCategories) {
      await this.categoriesService.addCategory(category.name, category.icon, "despesa");
    }

    // Adicionando categorias de receitas
    for (const category of defaultIncomeCategories) {
      await this.categoriesService.addCategory(category.name, category.icon, "receita");
    }

    console.log('Categorias iniciais de despesas e receitas com ícones adicionadas.');
  }
}

  
}
