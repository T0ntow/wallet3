import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faEllipsis, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ModalController, ToastController } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss'],
})
export class EditCategoryComponent implements OnInit {
  @Input() categoria: Category | undefined;
  @Input() categoryType: string | undefined;

  categoryForm: FormGroup;
  selectedIcon: IconDefinition = faEllipsis; // Agora é do tipo IconDefinition

  iconsGrouped: { title: string; items: { name: string; icon: IconDefinition }[] }[] = [];

  foodAndShoppingIcons: { icon: IconDefinition }[] = [];
  transportIcons: { icon: IconDefinition }[] = [];
  homeIcons: { icon: IconDefinition }[] = [];
  healthIcons: { icon: IconDefinition }[] = [];
  educationIcons: { icon: IconDefinition }[] = [];
  workAndFinanceIcons: { icon: IconDefinition }[] = [];
  entertainmentIcons: { icon: IconDefinition }[] = [];
  electronicsAndTechnologyIcons: { icon: IconDefinition }[] = [];
  fashionIcons: { icon: IconDefinition }[] = [];
  toolsIcons: { icon: IconDefinition }[] = [];
  peopleIcons: { icon: IconDefinition }[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private categoryLoaderService: CategoryLoaderService,
    private categoriesService: CategoriesService,
    private toastController: ToastController,
  ) {
    this.categoryForm = this.formBuilder.group({
      nome: ['', Validators.required],
      icone: [faEllipsis, Validators.required], // Define um valor padrão inicial
      tipo: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.categoria) {
      this.categoryForm.patchValue({
        nome: this.categoria.nome,
        icone: this.categoria.icone || faEllipsis, // Ícone padrão caso não esteja definido
        tipo: this.categoria.tipo,
      });
      this.selectedIcon = this.categoria.icone || faEllipsis;
    } else {
      this.categoryForm.patchValue({
        icone: faEllipsis, // Ícone padrão inicial
      });
      this.selectedIcon = faEllipsis;
    }

    // Carrega os ícones agrupados
    this.iconsGrouped = this.categoryLoaderService.getIcons();
  }

  getSelectedIcon(): IconDefinition {
    const allIcons = this.iconsGrouped.reduce<{ name: string; icon: IconDefinition }[]>((acc, group) => {
      return acc.concat(group.items);
    }, []);
  
    const icon = allIcons.find(item => item.icon === this.selectedIcon);
    return icon ? icon.icon : faEllipsis; // Retorna o ícone encontrado ou um ícone padrão
  }
  
  async selectIcon(icon: { name: string; icon: IconDefinition }) {
    this.selectedIcon = icon.icon; // Agora armazena o IconDefinition diretamente
    this.categoryForm.patchValue({ icone: this.selectedIcon }); // Atualiza o formulário
    await this.modalController.dismiss(); // Fecha o modal
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async submitCategory() {
    if (this.categoryForm.valid) {
      const { nome, icone, tipo } = this.categoryForm.value;
      const categoria_id = this.categoria?.id;

      try {
        // Chama o método do serviço para adicionar a conta no banco de dados
        await this.categoriesService.updateCategory(categoria_id!, nome, icone, tipo);

        await this.presentToast('Categoria editada com sucesso!', 'light');
        this.modalController.dismiss({ categoria: this.categoryForm });

        // Fecha o modal após o sucesso
        this.dismissModal();
      } catch (error) {
        await this.presentToast('Erro ao editar a categoria!', 'danger');
      }
    } else {
      console.log('Formulário inválido');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: "top"
    });
    toast.present();
  }

}
