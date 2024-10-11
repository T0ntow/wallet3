import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent  implements OnInit {
  selectedTab: string = 'home'; // Define uma aba padrão
  isSheetVisible: boolean = false;

  onTabChange(tab: string) {
    this.selectedTab = tab; // Atualiza a aba ativa
  }

  constructor() { }

  ngOnInit() {}

  toggleSheet() {
    this.isSheetVisible = !this.isSheetVisible; // Alterna a visibilidade do sheet
  }

  closeSheet() {
    this.isSheetVisible = false; // Fecha o sheet quando clicar fora
  }
}
