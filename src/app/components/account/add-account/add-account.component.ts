import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { faPiggyBank, faWallet, faArrowTrendUp, faBuildingColumns, faEllipsis} from '@fortawesome/free-solid-svg-icons'; // Ícone do cofrinho

import { AccountService } from 'src/app/services/account/account.service';
import { DatabaseService } from 'src/app/services/database.service';
import { BankService } from 'src/app/services/bank/bank.service';
@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss'],
})
export class AddAccountComponent implements OnInit {
  accountForm: FormGroup;
  bankLogos: Array<{ name: string; logo_url: string }> = []; // Para armazenar os logos de bancos

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
    private modalCtrl: ModalController,
    private bankService: BankService // Usando HttpClient para requisições HTTP
  ) {
    this.accountForm = this.formBuilder.group({
      instituicao: ['', Validators.required],
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      saldo: [null, Validators.required]
    });
  }

  async ngOnInit() {
    this.bankLogos = await this.bankService.fetchBankLogos();
    await this.databaseService.createDatabaseConnection();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async submitAccount() {
    if (this.accountForm.valid) {
      const { nome, tipo, instituicao, saldo } = this.accountForm.value;
      
      // Encontra o banco correspondente na lista de logos
      const bank = this.bankLogos.find(b => b.name.toLowerCase() === instituicao.toLowerCase());
  
      try {
        // Verifica se o banco foi encontrado
        const logo_url = bank ? bank.logo_url : ''; // Define logo_url como vazio se o banco não for encontrado
        
        // Chama o método do serviço para adicionar a conta no banco de dados
        await this.accountService.addAccount(nome, tipo, instituicao, saldo, logo_url);
  
        await this.presentToast('Conta criada com sucesso!', 'light');
        this.modalCtrl.dismiss({ conta: this.accountForm.value }); // Dismiss modal com os valores do formulário
  
      } catch (error) {
        console.error('Erro ao salvar a conta:', error); // Log detalhado do erro
        await this.presentToast('Erro ao salvar a conta! Tente novamente.', 'danger');
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
  
  async selectInstitution(institution: string) {
    this.selectedInstitution = institution;
    this.accountForm.patchValue({ instituicao: institution }); // Atualiza o campo do formulário
    await this.modalController.dismiss(); // Fecha o modal
  }

  // Seleciona o tipo de conta e atualiza o formulário
  async selectAccountType(accountType: string) {
    this.selectedAccountType = accountType;
    this.accountForm.patchValue({ tipo: accountType }); // Atualiza o campo do formulário
    await this.modalController.dismiss(); // Fecha o modal
  }
}
