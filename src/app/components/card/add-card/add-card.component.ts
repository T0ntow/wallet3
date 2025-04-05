import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { BankService } from 'src/app/services/bank/bank.service';
import { CardService } from 'src/app/services/card/card.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
})
export class AddCardComponent implements OnInit {
  cardForm: FormGroup;
  bankLogos: Array<{ name: string; logo_url: string }> = []; // Para armazenar os logos de bancos

  selectedInstitution: string | null = null;
  formattedLimit: string | null = null;

  constructor(
    private databaseService: DatabaseService,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastController: ToastController,
    private modalCtrl: ModalController,
    private cardService: CardService,
    private bankService: BankService // Usando HttpClient para requisições HTTP
  ) {
    this.cardForm = this.formBuilder.group({
      institution: ['', Validators.required], // Validates that 'institution' is not empty
      name: ['', Validators.required],        // Validates that 'name' is not empty
      limite_total: [null, [Validators.required, Validators.min(0)]], // Ensures 'limit' is a number >= 0
      closing_day: [null, [Validators.required, Validators.min(1), Validators.max(31)]], // Ensures 'closing_day' is between 1 and 31
    });
  }

  async ngOnInit() {
    this.bankLogos = await this.bankService.fetchBankLogos();
    await this.databaseService.createDatabaseConnection();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async submitCard() {
    if (this.cardForm.valid) {
      // Extract form values
      const { institution, name, limite_total, closing_day } = this.cardForm.value;
      const limite_atual = limite_total
  
      // Find the matching bank from the bankLogos list
      const bank = this.bankLogos.find(
        (b) => b.name.toLowerCase() === institution.toLowerCase()
      );
  
      try {
        // Determine the logo URL or set it as an empty string if not found
        const logo_url = bank ? bank.logo_url : '';
  
        // Call the CardService method to add a card to the database
        await this.cardService.addCard(name,  institution, limite_total, limite_atual, logo_url, closing_day);
  
        // Show a success message
        await this.presentToast('Cartão criada com sucesso!', 'light');
  
        // Dismiss the modal with the form values
        this.modalCtrl.dismiss({ cartao: this.cardForm.value });
      } catch (error) {
        // Log detailed error information for debugging
        console.error('Erro ao salvar o cartão:', error);
  
        // Show an error message to the user
        await this.presentToast('Erro ao salvar o cartão! Tente novamente.', 'danger');
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
    this.cardForm.patchValue({ institution: institution }); // Atualiza o campo do formulário
    await this.modalController.dismiss(); // Fecha o modal
  }

}
