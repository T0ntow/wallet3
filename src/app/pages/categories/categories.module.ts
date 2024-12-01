import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoriesPageRoutingModule } from './categories-routing.module';

import { CategoriesPage } from './categories.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddCategoryComponent } from 'src/app/components/categories/add-category/add-category.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EditCategoryComponent } from 'src/app/components/categories/edit-category/edit-category.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoriesPageRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule
  ],
  declarations: [
    CategoriesPage,
    EditCategoryComponent,
    AddCategoryComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Adicione esta linha
})
export class CategoriesPageModule {}
