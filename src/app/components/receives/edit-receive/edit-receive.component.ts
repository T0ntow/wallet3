import { Component, inject, Input, input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';
import { CategoryLoaderService } from 'src/app/services/categories/category-loader-service.service';
import { Account } from 'src/app/models/account.model';
import { AccountService } from 'src/app/services/account/account.service';
import { TransactionsService } from 'src/app/services/transactions/transactions.service';
import * as moment from 'moment';

import { Transacao } from 'src/app/models/transaction.model';
import { MaskitoElementPredicate } from '@maskito/core';
import { maskitoPrice } from '../../../mask';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-edit-receive',
  templateUrl: './edit-receive.component.html',
  styleUrls: ['./edit-receive.component.scss'],
})
export class EditReceiveComponent  implements OnInit {
  transacaoForm: FormGroup;
  selectedAccount: string = '';
  selectedAccountLogo: string | undefined;

  selectedCategory: string = '';
  selectedCategoryIcon: IconDefinition | undefined;
  
  periodo: string = '';

  categories: Category[] = [];
  accounts: Account[] = [];

  categoryLoaderService = inject(CategoryLoaderService)
  accountService = inject(AccountService)
  transactionService = inject(TransactionsService)

  @Input() receita: Transacao | undefined;

  recorrente: boolean = false; // Estado para controle de "recorrente"
    readonly maskitoPrice = maskitoPrice;
    readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();
  

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
        valor: [null, Validators.required],
        valor_parcela: [{ value: '', disabled: true }], // Inicialmente desabilitado
        status: ['pago', Validators.required],
        tipo: ['receita'],
        is_parcelado: [false],
        num_parcelas: [null],
        is_recorrente: [false],
        quantidade_repetir: [null],
        periodo: [null],
        mes_fatura: [null]
      }); // Adicionando o validador personalizado
    }
  
    @ViewChild('popover') popover: { event: Event; } | undefined;
  
    isOpen = false;
  
    async ngOnInit() {
      // Se `despesa` estiver definida, inicializa os valores do formulário com ela
      if (this.receita) {
        this.transacaoForm.patchValue({
          descricao: this.receita.descricao,
          conta_id: this.receita.conta_id,
          data: this.receita.data_transacao,
          valor: this.receita.valor,
          status: this.receita.status
        });
      }
  
      // Carregar categorias e contas
      try {
        this.categories = await this.categoryLoaderService.loadCategoriesByReceveis();
        this.accounts = await this.accountService.getAccounts();
  
        // Despesa titpo conta
        if (this.receita && this.receita.conta_id) {
          this.getCategoryById(this.receita?.categoria_id);
          this.getAccountById(this.receita?.conta_id);
        }
      } catch (error) {
        console.error('Error loading categories or accounts:', error);
      }
    }
  
    presentPopover(e: Event) {
      this.popover!.event = e;
      this.isOpen = true;
    }
  
    dismissModal() {
      this.modalController.dismiss();
    }
  
    getAccountById(id: number) {
      const firstAccount = this.accounts[0];
      this.selectedAccountLogo = firstAccount.logo_url;
  
      const account = this.accounts.find(account => account.conta_id === id);
      if (account)
        this.selectAccountInitial(account);
    }
  
    getCategoryById(id: number) {
      const firstCategory = this.categories[0];
      this.selectedCategoryIcon = firstCategory.icone;
      
      const category = this.categories.find(category => category.id === id);
      if (category)
        this.selectCategoryInitial(category);
    }
  
    async selectCategoryInitial(category: Category) {
      this.selectedCategory = category.nome;
      this.transacaoForm.patchValue({ categoria_id: category.id }); // Atualiza o valor do ícone no formulário
    }
  
    async selectAccountInitial(account: Account) {
      this.selectedAccount = account.nome;
      this.transacaoForm.patchValue({ conta_id: account.conta_id }); // Atualiza o valor do ícone no formulário
    }
  
    async selectCategory(category: Category) {
      this.selectedCategory = category.nome;
      this.transacaoForm.patchValue({ categoria_id: category.id }); // Atualiza o valor do ícone no formulário
      await this.modalController.dismiss(); // Fecha o modal
    }
  
    async selectAccount(account: Account) {
      this.selectedAccount = account.nome;
      this.transacaoForm.patchValue({ conta_id: account.conta_id }); // Atualiza o valor do ícone no formulário
      await this.modalController.dismiss(); // Fecha o modal
    }
  
    selectPeriod(period: string) {
      this.periodo = period;
      this.isOpen = false; // Fecha o popover
    }
    
    toggleRecorrente(event: any) {
      this.recorrente = event.detail.checked;
      console.log('Recorrente:', this.recorrente);
    }
  
    submitTransacao() {
      if (this.transacaoForm.valid) {
        const formData = this.transacaoForm.value;
        const transacao_id = this.receita?.transacao_id;
  
        // Formatação dos dados da transação
        const transacao = {
          descricao: formData.descricao,
          conta_id: formData.conta_id || null,
          cartao_id: formData.cartao_id || null,
          categoria_id: formData.categoria_id,
          tipo: formData.tipo,  // "despesa" ou "receita", deve estar no formulário
          data_transacao: moment(formData.data).format('YYYY-MM-DD'), // Formato para data de transação
          valor: parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.')),
          status: formData.status, // Status padrão, como 'pendente'
          is_parcelado: formData.is_parcelado,
          num_parcelas: formData.num_parcelas || null,
          valor_parcela: formData.valor_parcela || null,
          is_recorrente: formData.is_recorrente,
          quantidade_repetir: formData.quantidade_repetir || null,
          periodo: formData.periodo || null,
          fk_parcelas_parcela_id: formData.fk_parcelas_parcela_id || null,
          mes_fatura: formData.mes_fatura || null
        };
  
        // Chama o serviço para atualizar a transação no banco de dados
        this.transactionService.updateTransaction(
          transacao_id!,
          transacao.conta_id,
          transacao.cartao_id,
          transacao.categoria_id,
          transacao.tipo,
          transacao.valor,
          transacao.descricao,
          transacao.is_parcelado,
          transacao.num_parcelas,
          transacao.valor_parcela,
          transacao.is_recorrente,
          transacao.quantidade_repetir,
          transacao.periodo,
          transacao.status,
          transacao.fk_parcelas_parcela_id,
          transacao.data_transacao,
          transacao.mes_fatura
        )
          .then(async () => {
            console.log('Transação editada com sucesso');
            await this.presentToast('Transação editada com sucesso!', 'light');
            this.modalController.dismiss({ transacao: this.transacaoForm });
            this.transacaoForm.reset(); // Reseta o formulário após o sucesso
          })
          .catch(error => {
            console.error('Erro ao editar transação:', error);
          });
      } else {
        console.log('Formulário inválido');
      }
    }
  
    async presentToast(message: string, color: string) {
      const toast = await this.toastController.create({
        message,
        duration: 1500,
        color,
        position: "top"
      });
      toast.present();
    }
  }
  