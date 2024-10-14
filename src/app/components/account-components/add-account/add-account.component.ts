import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { faPiggyBank, faWallet, faArrowTrendUp, faBuildingColumns, faEllipsis} from '@fortawesome/free-solid-svg-icons'; // Ícone do cofrinho
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
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private http: HttpClient // Usando HttpClient para requisições HTTP

  ) {
    this.accountForm = this.formBuilder.group({
      institution: ['', Validators.required],
      name: ['', Validators.required],
      accountType: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.fetchBankLogos(); // Chama a função para carregar os logos dos bancos
  }

  dismissModal() {
    this.modalController.dismiss();
  }


  submitAccount() {
    if (this.accountForm.valid) {
      console.log('Expense submitted:', this.accountForm.value);
      // Adicione a lógica para salvar a despesa aqui
      this.dismissModal();
    }
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
    this.closeSheet();
  }

  selectAccountType(accountType: string) {
    this.selectedAccountType = accountType;
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
