import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ModalController, ToastController } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';
import { CategoriesService } from 'src/app/services/categories.service';
import { CategoryLoaderService } from 'src/app/services/category-loader-service.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent  implements OnInit {
  categoryForm: FormGroup;
  selectedIcon: string = '';

  icons: { icon: IconDefinition }[] = []; // Armazena os ícones e seus nomes

  isIconSheetVisible: boolean = false;

  @Input() categoryType: string | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private categoryLoaderService: CategoryLoaderService,
    private categoriesService: CategoriesService,
    private toastController: ToastController,
  ) {
    this.categoryForm = this.formBuilder.group({
      nome: ['', Validators.required],   
      icone: ['', Validators.required],          
      tipo: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.icons = this.categoryLoaderService.getIcons();
    console.log("categoryType", this.categoryType);
    this.categoryForm.patchValue({ tipo: this.categoryType }); // Atualiza o valor do ícone no formulário
  }
  
  selectIcon(icon: IconDefinition) {
    this.selectedIcon = icon.iconName; 
    this.categoryForm.patchValue({ icone: this.selectedIcon }); // Atualiza o valor do ícone no formulário
    this.closeSheet(); // Fecha a folha de seleção de ícones
  }

  closeSheet() {
    this.isIconSheetVisible = false;
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  toggleSheet(sheet: string) {
    if (sheet === 'icon') {
      this.isIconSheetVisible = !this.isIconSheetVisible;
    } 
  }

  async submitCategory() {
    if (this.categoryForm.valid) {
      const { nome, icone, tipo } = this.categoryForm.value;
  
      try {
        // Chama o método do serviço para adicionar a conta no banco de dados
        await this.categoriesService.addCategory(nome, icone, tipo);
  
        await this.presentToast('Categoria criada com sucesso!', 'success');
        this.modalController.dismiss({ categoria: this.categoryForm });
  
        // Fecha o modal após o sucesso
        this.dismissModal();
      } catch (error) {
        await this.presentToast('Erro ao salvar a categoria!', 'danger');
      }
    } else {
      console.log('Formulário inválido');
    }
  }
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }
}
