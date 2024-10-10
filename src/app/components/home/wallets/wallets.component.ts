import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.component.html',
  styleUrls: ['./wallets.component.scss'],
})
export class WalletsComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}
  getIconUrl(bank: string): string {
    return `https://cdn.jsdelivr.net/npm/simple-icons/icons/${bank}.svg`;
  }
  
}
