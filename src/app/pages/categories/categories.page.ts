import { Component, OnInit } from '@angular/core';
import { faUtensils, faBus, faHeartbeat, faGraduationCap, faFutbol, faShoppingCart, faHome, faLightbulb, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  segmentValue: string = 'despesas';  // Valor padrão do segmento
  selectedCategory: string = '';


  // Logos
  faUtensils = faUtensils;
  faBus = faBus;
  faHeartbeat = faHeartbeat;
  faGraduationCap = faGraduationCap;
  faFutbol = faFutbol;
  faShoppingCart = faShoppingCart;
  faHome = faHome;
  faLightbulb = faLightbulb;
  faEllipsisH = faEllipsisH;


  constructor() { }

  ngOnInit() {
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }


}
