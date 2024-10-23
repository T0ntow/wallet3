import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BankService } from 'src/app/services/bank.service';

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
  bankLogos: Array<{ name: string; logoUrl: string }> = []; // Para armazenar os logos de bancos
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

}
