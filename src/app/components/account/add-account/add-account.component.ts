import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { faPiggyBank, faWallet, faArrowTrendUp, faBuildingColumns, faEllipsis} from '@fortawesome/free-solid-svg-icons'; // Ícone do cofrinho

import { AccountService } from 'src/app/services/account.service';
import { DatabaseService } from 'src/app/services/database.service';
@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss'],
})
export class AddAccountComponent implements OnInit {
  accountForm: FormGroup;
  bankLogos: Array<{ name: string; logoUrl: string | null }> = []; // Para armazenar os logos de bancos

  isInstitutionSheetVisible = false;
  isAccountTypeSheetVisible = false;
  selectedInstitution: string | null = null;
  selectedAccountType: string | null = null;

  // icones
  faPiggyBank = faPiggyBank;
  faWallet = faWallet;
  faArrowTrendUp = faArrowTrendUp;
  faBuildingColumns = faBuildingColumns;
  faEllipsis = faEllipsis;

  constructor(
    private databaseService: DatabaseService,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private http: HttpClient,
    private toastController: ToastController,
    private modalCtrl: ModalController // Usando HttpClient para requisições HTTP
  ) {
    this.accountForm = this.formBuilder.group({
      instituicao: ['', Validators.required],
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      saldo: [null, Validators.required]
    });
  }

  async ngOnInit() {
    this.fetchBankLogos(); // Chama a função para carregar os logos dos bancos
    await this.databaseService.createDatabaseConnection();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async submitAccount() {
    if (this.accountForm.valid) {
      const { nome, tipo, instituicao, saldo } = this.accountForm.value;
  
      try {
        // Chama o método do serviço para adicionar a conta no banco de dados
        await this.accountService.addAccount(nome, tipo, instituicao, saldo);
  
        await this.presentToast('Conta criada com sucesso!', 'success');
        this.modalCtrl.dismiss({ conta: this.accountForm });
  
        // Fecha o modal após o sucesso
        this.dismissModal();
      } catch (error) {
        await this.presentToast('Erro ao salvar a conta!', 'danger');
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
  

  // Sheets 
  toggleSheet(sheetType: string) {
    if (sheetType === 'institution') {
      this.isInstitutionSheetVisible = true;
      this.isAccountTypeSheetVisible = false;
    } else if (sheetType === 'accountType') {
      this.isInstitutionSheetVisible = false;
      this.isAccountTypeSheetVisible = true;
    }
  }

  closeSheet() {
    this.isInstitutionSheetVisible = false;
    this.isAccountTypeSheetVisible = false;
  }

  selectInstitution(institution: string) {
    this.selectedInstitution = institution;
    this.accountForm.patchValue({ instituicao: institution }); // Atualiza o campo do formulário
    this.closeSheet();
  }

  // Seleciona o tipo de conta e atualiza o formulário
  selectAccountType(accountType: string) {
    this.selectedAccountType = accountType;
    this.accountForm.patchValue({ tipo: accountType }); // Atualiza o campo do formulário
    this.closeSheet();
  }

  async fetchBankLogos() {
    const apiKey = 'pk_eyQ5ESuFQ3-4_kpNJSUKfg'; // Substitua pela sua chave da API logo.dev
    const banks = [
      {
        url: 'alelo.com.br',
        name: 'Alelo'
      },
      {
        url: 'amedigital.com',
        name: 'Ame digital'
      },
      {
        url: 'nubank.com.br',
        name: 'Nubank'
      },
      {
        url: 'bb.com.br',
        name: 'Banco do Brasil'
      },
      {
        url: 'willbank.com.br',
        name: 'Will Bank'
      },
      {
        url: 'bancopan.com.br',
        name: 'Banco Pan'
      },
      {
        url: 'c6bank.com.br',
        name: 'C6 Bank'
      },
      {
        url: 'cambio.bradesco',
        name: 'Bradesco'
      },
      {
        url: 'caixa.gov.br',
        name: 'Caixa'
      },
      {
        url: 'digio.com.br',
        name: 'Digio'
      },
      {
        url: 'mercadopago.com',
        name: 'Mercado Pago'
      },
      {
        url: 'meliuz.com.br',
        name: 'Meliuz'
      },
      {
        url: 'santanderbank.com',
        name: 'Santander Bank'
      },
      {
        url: 'paypal.com',
        name: 'PayPal'
      },
      {
        url: 'picpay.com',
        name: 'PicPay'
      },
   
      {
        url: 'itau.com.ar',
        name: 'Itaú'
      },
      {
        url: 'claropay.com',
        name: 'Claro Pay'
      },
      {
        url: 'xpi.com.br',
        name: 'XP'
      }
    ];

    try {
      this.bankLogos = banks.map((bank) => {
        const logoUrl = `https://img.logo.dev/${encodeURIComponent(bank.url)}?token=${apiKey}`;
        console.log(logoUrl);

        return { name: bank.name, logoUrl };
      });
      
    } catch (error) {
      console.error('Erro ao buscar logos dos bancos:', error);
    }
  }


}
