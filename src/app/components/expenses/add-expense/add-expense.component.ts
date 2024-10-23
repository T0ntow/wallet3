import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { faUtensils, faBus, faHeartbeat, faGraduationCap, faFutbol, faShoppingCart, faHome, faLightbulb, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Category } from 'src/app/models/category.model';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';
import { Account } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account/account.service';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})
export class AddExpenseComponent  implements OnInit {
  transacaoForm: FormGroup;
  selectedAccount: string = '';
  selectedCategory: string = '';
  periodo: string = '';

  isCategoriesSheetVisible: boolean = false;
  isAccountSheetVisible: boolean = false;

  // toogle repetir
  recorrente: boolean = false; // Estado para controle de "recorrente"
  
  //Categorias
  categories: Category[] = [];
  accounts: Account[] = [];

  categoryLoaderService = inject(CategoryLoaderService)
  accountService = inject(AccountService)
  transactionService = inject(TransactionsService)

  faBus = faBus

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    this.transacaoForm = this.formBuilder.group({
      descricao: ['', Validators.required],
      conta_id: [null],
      categoria_id: [null, Validators.required],
      data: ['', Validators.required],
      valor: ['', Validators.required],
      status: ['pago', Validators.required], 
      tipo:['despesa'], 
      is_parcelado: [false],
      num_parcelas: [null],
      is_recorrente: [false],
      quantidade_repetir: [null],
      periodo: [null]
    });
    
  }

  @ViewChild('popover') popover: { event: Event; } | undefined;

  isOpen = false;

  presentPopover(e: Event) {
    this.popover!.event = e;
    this.isOpen = true;
  }
  
  async ngOnInit() {
    try {
      this.categories = await this.categoryLoaderService.loadCategories();
      this.accounts = await this.accountService.getAccounts();
    } catch (error) {
      console.error('Error loading categories or accounts:', error);
    }
  }
  
  dismissModal() {
    this.modalController.dismiss();
  }

  selectCategory(category: Category) {
    this.selectedCategory = category.nome;
    this.transacaoForm.patchValue({ categoria_id: category.id }); // Atualiza o valor do ícone no formulário
    this.closeSheet();
  }

  selectAccount(account: Account) {
    this.selectedAccount = account.nome;
    this.transacaoForm.patchValue({ conta_id: account.conta_id }); // Atualiza o valor do ícone no formulário

    this.closeSheet();
  }

  selectPeriod(period: string) {
    this.periodo = period;
    this.isOpen = false; // Fecha o popover
  }

  toggleRecorrente(event: any) {
    this.recorrente = event.detail.checked;
    console.log('Recorrente:', this.recorrente);
  }

  toggleSheet(sheet: string) {
    if (sheet === 'account') {
      this.isAccountSheetVisible = !this.isAccountSheetVisible;
      this.isCategoriesSheetVisible = false;  // Fechar o sheet de categorias
    } else if (sheet === 'category') {
      this.isCategoriesSheetVisible = !this.isCategoriesSheetVisible;
      this.isAccountSheetVisible = false;    // Fechar o sheet de contas
    }
  }

  closeSheet() {
    this.isCategoriesSheetVisible = false;
    this.isAccountSheetVisible = false;
  }

  submitTransacao() {
    if (this.transacaoForm.valid) {
      const formData = this.transacaoForm.value;
  
      // Formatação dos dados
      const transacao = {
        descricao: formData.descricao,
        conta_id: formData.conta_id || null,
        cartao_id: formData.cartao_id || null,
        categoria_id: formData.categoria_id,
        tipo: formData.tipo,  // "despesa" ou "receita", deve ser parte do seu formulário
        data: formData.data,
        valor: formData.valor,
        status: formData.status || 'pendente',  // Adicionando status, padrão como 'pendente'
        is_parcelado: formData.is_parcelado,
        num_parcelas: formData.num_parcelas || null,
        is_recorrente: formData.is_recorrente,
        quantidade_repetir: formData.quantidade_repetir || null,
        periodo: formData.periodo || null,
        fk_parcelas_parcela_id: formData.fk_parcelas_parcela_id || null  // Caso aplicável
      };
  
      // Chama o serviço para salvar a transação no banco de dados
      this.transactionService.addTransaction(
        transacao.conta_id,
        transacao.cartao_id,
        transacao.categoria_id,
        transacao.tipo,
        transacao.valor,
        transacao.descricao,
        transacao.is_parcelado,
        transacao.num_parcelas,
        transacao.is_recorrente,
        transacao.quantidade_repetir,
        transacao.periodo,
        transacao.fk_parcelas_parcela_id,
        transacao.status // Enviando status para o método
      )
      .then(async () => {
        console.log('Transação adicionada com sucesso');
        await this.presentToast('Transação adicionada com sucesso!', 'success');
        this.modalController.dismiss({ transacao: this.transacaoForm });

        this.transacaoForm.reset(); // Reseta o formulário
      })
      .catch(error => {
        console.error('Erro ao adicionar transação:', error);
      });
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
