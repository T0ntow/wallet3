import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss'],
})
export class BalanceComponent  implements OnInit {
  saldo: number = -325.90;
  receita: number = 950.40;
  despesa: number = 500.23;
  mes: string = 'Setembro';

  constructor() { }

  ngOnInit() {}

}
