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
import * as moment from 'moment';
import { maskitoPrice } from '../../../mask';

import { AbstractControl, ValidatorFn } from '@angular/forms';
import { MaskitoElementPredicate } from '@maskito/core';

export function atLeastOneRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const valor = control.get('valor')?.value;
    const valor_parcela = control.get('valor_parcela')?.value;
    const is_parcelado = control.get('is_parcelado')?.value;

    // Validação: se `is_parcelado` é verdadeiro, `valor_parcela` é obrigatório
    if (is_parcelado && !valor_parcela) {
      return { required: true };
    }

    // Validação: se não é parcelado, `valor` é obrigatório
    if (!is_parcelado && !valor) {
      return { required: true };
    }

    return null; // Sem erros
  };
}

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})
export class AddExpenseComponent implements OnInit {
  transacaoForm: FormGroup;
  selectedAccount: string = '';
  selectedAccountLogo: string | undefined;

  selectedCategory: string = '';
  selectedCategoryIcon: IconDefinition | undefined;

  periodo: string = '';

  // toogle repetir
  recorrente: boolean = false; // Estado para controle de "recorrente"

  //Categorias
  categories: Category[] = [];
  accounts: Account[] = [];

  categoryLoaderService = inject(CategoryLoaderService)
  accountService = inject(AccountService)
  transactionService = inject(TransactionsService)

  faBus = faBus

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
      data: [moment().format('YYYY-MM-DD'), Validators.required],
      valor: [null, [Validators.required, Validators.min(0)]], // Valor inicial como null e validado como número
      valor_parcela: [{ value: '', disabled: true }], // Inicialmente desabilitado
      status: ['pago', Validators.required],
      tipo: ['despesa'],
      is_parcelado: [false],
      num_parcelas: [null],
      is_recorrente: [false],
      quantidade_repetir: [{ value: null, disabled: true }], // Inicialmente desabilitado
      periodo: [{ value: null, disabled: true }], // Inicialmente desabilitado
      mes_fatura: [null]
    }, { validators: atLeastOneRequiredValidator() }); // Adicionando o validador personalizado

    this.transacaoForm.get('is_parcelado')?.valueChanges.subscribe((isParcelado: boolean) => {
      this.toggleCampoParcelado(isParcelado);
    });

    this.transacaoForm.get('is_recorrente')?.valueChanges.subscribe((isRecorrente: boolean) => {
      this.toggleCamposRecorrencia(isRecorrente);
    });
  }

  @ViewChild('popover') popover: { event: Event; } | undefined;

  isOpen = false;

  presentPopover(e: Event) {
    this.popover!.event = e;
    this.isOpen = true;
  }

  private toggleCampoParcelado(isParcelado: boolean) {
    const valorParcelaControl = this.transacaoForm.get('valor_parcela');

    if (isParcelado) {
      valorParcelaControl?.enable();
    } else {
      valorParcelaControl?.disable();
      valorParcelaControl?.reset(); // Opcional: limpar o campo
    }
  }

  private toggleCamposRecorrencia(isRecorrente: boolean) {
    // Obtém os controles do formulário
    const quantidadeRepetirControl = this.transacaoForm.get('quantidade_repetir');
    const periodoControl = this.transacaoForm.get('periodo');

    if (isRecorrente) {
      // Habilita os campos
      quantidadeRepetirControl?.enable();
      periodoControl?.enable();

      // Adiciona validadores (opcional)
      quantidadeRepetirControl?.setValidators([Validators.required]);
      periodoControl?.setValidators([Validators.required]);
    } else {
      // Desabilita os campos
      quantidadeRepetirControl?.disable();
      periodoControl?.disable();

      // Remove validadores e reseta os campos
      quantidadeRepetirControl?.clearValidators();
      quantidadeRepetirControl?.reset(); // Limpa o valor do campo

      periodoControl?.clearValidators();
      periodoControl?.reset(); // Limpa o valor do campo
    }

    // Atualiza o estado de validação dos campos
    quantidadeRepetirControl?.updateValueAndValidity();
    periodoControl?.updateValueAndValidity();
  }


  async ngOnInit() {
    try {
      // Carregar categorias e contas
      this.categories = await this.categoryLoaderService.loadCategoriesByExpenses();
      this.accounts = await this.accountService.getAccounts();

      // Selecionar a primeira conta automaticamente, se disponível
      if (this.accounts.length > 0) {
        const firstAccount = this.accounts[0];
        this.selectedAccount = firstAccount.nome; // Atualiza o nome da conta 
        // selecionada

        this.selectedAccountLogo = firstAccount.logo_url;
        this.transacaoForm.patchValue({ conta_id: firstAccount.conta_id }); // Atualiza o ID da conta no formulário
      }

      // Inicializar Categoria
      if (this.categories.length > 0) {
        const firstCategory = this.categories[0];
        this.selectedCategory = firstCategory.nome;// Atualiza o nome da conta selecionada
        this.selectedCategoryIcon = firstCategory.icone;

        this.transacaoForm.patchValue({ categoria_id: firstCategory.id });
      }
    } catch (error) {
      console.error('Error loading categories or accounts:', error);
    }
  }

  dismissModal() {
    this.modalController.dismiss();
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
    this.transacaoForm.patchValue({ periodo: period });
    console.log('Periodo:', period);

    this.isOpen = false; // Fecha o popover
  }

  toggleRecorrente(event: any) {
    this.transacaoForm.patchValue({ is_recorrente: event.detail.checked });
    const isRecorrente = this.transacaoForm.get('is_recorrente')?.value;
    console.log('Recorrente:', isRecorrente);

    this.recorrente = event.detail.checked;
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
        // Formatação da data usando moment
        data: moment(formData.data).format('YYYY-MM-DD'), // Formato desejado
        valor: parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.')),
        status: formData.status,  // Adicionando status, padrão como 'pendente'
        is_parcelado: formData.is_parcelado,
        num_parcelas: formData.num_parcelas || null,
        is_recorrente: formData.is_recorrente,
        quantidade_repetir: formData.quantidade_repetir || null,
        periodo: formData.periodo || null,
        fk_parcelas_parcela_id: formData.fk_parcelas_parcela_id || null, // Caso aplicável
        valor_parcela: formData.valor_parcela || null,
        mes_fatura: formData.mes_fatura || null
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
        transacao.valor_parcela,
        transacao.is_recorrente,
        transacao.quantidade_repetir,
        transacao.periodo,
        transacao.status, // Enviando status para o método
        transacao.fk_parcelas_parcela_id,
        transacao.data, // Enviando data formatada
        transacao.mes_fatura
      )
        .then(async () => {
          console.log('Transação adicionada com sucesso');
          await this.presentToast('Transação adicionada com sucesso!', 'light');
          console.log("TRANSAÇÂO", transacao);

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
      duration: 1500,
      color,
      position: "top"
    });
    toast.present();
  }

}
