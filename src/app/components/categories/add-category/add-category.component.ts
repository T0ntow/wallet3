import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faEllipsis, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ModalController, ToastController } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss'],
})
export class AddCategoryComponent implements OnInit {
  categoryForm: FormGroup;
  selectedIcon: string = '';

  iconsGrouped: { title: string; items: { name: string; icon: IconDefinition }[] }[] = [];

  @Input() categoryType: string | undefined;


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
      icone: ['', Validators.required],
      tipo: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.iconsGrouped = this.categoryLoaderService.getIcons();
    this.categoryForm.patchValue({ tipo: this.categoryType });
  }

  async selectIcon(icon: { name: string; icon: IconDefinition }) {
    this.selectedIcon = icon.name;
    this.categoryForm.patchValue({ icone: this.selectedIcon }); // Atualiza o valor do ícone no formulário
    await this.modalController.dismiss(); // Fecha o modal
  }


  // Corrigindo o tipo do acumulador no `reduce`
  getSelectedIcon(): IconDefinition {
    // Achata a lista de ícones
    const allIcons = this.iconsGrouped.reduce<{ name: string; icon: IconDefinition }[]>((acc, group) => {
      return acc.concat(group.items); // Adiciona os itens do grupo ao acumulador
    }, []); // Define o tipo explicitamente como um array de objetos com nome e ícone

    // Encontra o ícone correspondente ao nome selecionado
    const icon = allIcons.find(item => item.name === this.selectedIcon);
    return icon ? icon.icon : faEllipsis; // Retorna o ícone encontrado ou um padrão
  }


  dismissModal() {
    this.modalController.dismiss();
  }

  async submitCategory() {
    if (this.categoryForm.valid) {
      const { nome, icone, tipo } = this.categoryForm.value;

      try {
        // Chama o método do serviço para adicionar a conta no banco de dados
        await this.categoriesService.addCategory(nome, icone, tipo);

        await this.presentToast('Categoria criada com sucesso!', 'light');
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
