import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BankService } from 'src/app/services/bank/bank.service';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
})
export class AddCardComponent implements OnInit {
  price: number | null = null;
  accountForm: FormGroup;
  isSheetVisible: boolean = false;
  selectedInstitution: string | null = null;
  bankLogos: Array<{ name: string; logo_url: string }> = []; // Para armazenar os logos de bancos
  formattedLimit: string | null = null;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private currencyPipe: CurrencyPipe,// Usando HttpClient para requisições HTTP
    private bankService: BankService

  ) {
    this.accountForm = this.formBuilder.group({
      institution: ['', Validators.required],
      name: ['', Validators.required],
      limit: ['', Validators.required],
      closing_day: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.bankLogos = await this.bankService.fetchBankLogos();
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

  toggleSheet() {
    console.log("toogle");
    this.isSheetVisible = !this.isSheetVisible; // Alterna a visibilidade do sheet
  }

  closeSheet() {
    this.isSheetVisible = false; // Fecha o sheet quando clicar fora
  }


  selectInstitution(institution: string) {
    this.selectedInstitution = institution;
    this.accountForm.controls['institution'].setValue(institution); // Define o valor no formulário
    this.toggleSheet(); // Fecha a folha após a seleção
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
        const logo_url = `https://img.logo.dev/${encodeURIComponent(bank.url)}?token=${apiKey}`;
        console.log(logo_url);

        return { name: bank.name, logo_url };
      });

    } catch (error) {
      console.error('Erro ao buscar logos dos bancos:', error);
    }
  }

}
