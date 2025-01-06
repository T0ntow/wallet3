import { Component, inject, OnInit } from '@angular/core';
import { Category } from 'src/app/models/category.model';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';
import { ModalController } from '@ionic/angular';
import { AddCategoryComponent } from 'src/app/components/categories/add-category/add-category.component';
import { DatabaseService } from 'src/app/services/database.service';
import { EditCategoryComponent } from 'src/app/components/categories/edit-category/edit-category.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})

export class CategoriesPage implements OnInit {
  segmentValue: string = 'despesas';  // Valor padrão do segmento
  categories: Category[] = [];
  expenseCategories: Category[] = [];
  incomeCategories: Category[] = [];

  categoryLoaderService = inject(CategoryLoaderService)
  databaseService = inject(DatabaseService)

  isModalOpen = false;
  selectedCategory: Category | undefined;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  async ngOnInit() {
    await this.databaseService.createDatabaseConnection();

    // Subscription to handle transaction updates
    this.categoryLoaderService.categoriesUpdated$.subscribe({
      next: async () => {
        await this.getCatgories();
      },
      error: err => console.error("Subscription error:", err)
    });
  }

  async getCatgories() {
    const allCategories = await this.categoryLoaderService.loadCategories();

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

  openModal(categoria: Category) {
    this.selectedCategory = categoria;
    console.log("this.selectedCategory", JSON.stringify(this.selectedCategory));

    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory = undefined; // Limpa a despesa selecionada
  }

  async editCategory(categoria: Category | undefined) {
    const modal = await this.modalCtrl.create({
      component: EditCategoryComponent,
      componentProps: { categoria: categoria }
    });
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.categoryLoaderService.notifyCategoriesUpdate()
        this.closeModal();
      }
    });

    return await modal.present();
  }
}
