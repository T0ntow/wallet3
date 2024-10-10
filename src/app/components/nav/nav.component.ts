import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent  implements OnInit {
  selectedTab: string = 'home'; // Define uma aba padrão

  onTabChange(tab: string) {
    this.selectedTab = tab; // Atualiza a aba ativa
  }

  constructor() { }

  ngOnInit() {}

}
