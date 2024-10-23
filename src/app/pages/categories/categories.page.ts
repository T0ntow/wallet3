import { Component, inject, OnInit } from '@angular/core';
import { Category } from 'src/app/models/category.model';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';
import { ModalController } from '@ionic/angular';
import { AddCategoryComponent } from 'src/app/components/categories/add-category/add-category.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],  
})

export class CategoriesPage implements OnInit {
  segmentValue: string = 'despesas';  // Valor padrão do segmento
  selectedCategory: string = '';

  categories: Category[] = [];
  expenseCategories: Category[] = [];
  incomeCategories: Category[] = [];

  categoryLoaderService = inject(CategoryLoaderService)
  
  constructor(
    private modalCtrl: ModalController,
  ) {}

  async ngOnInit() {
   await this.getCatgories();
  }

  async getCatgories() {
    const allCategories = await this.categoryLoaderService.loadCategories();

    // Separa as categorias em despesas e receitas
    this.expenseCategories = allCategories.filter(category => category.tipo === 'despesa');
    this.incomeCategories = allCategories.filter(category => category.tipo === 'receita');
  }

  selectCategory(categoryName: string) {
    console.log('Categoria selecionada:', categoryName);
  }

  async addCategory(categoryType: string) {
    const modal = await this.modalCtrl.create({
      component: AddCategoryComponent,
      componentProps: {
        categoryType: categoryType// Passe a categoria como uma propriedade
      }
    });
  
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.getCatgories()
      }
    });
  
    return await modal.present();
  }
}
