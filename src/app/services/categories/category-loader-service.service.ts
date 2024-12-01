import { Injectable } from '@angular/core';
import { CategoriesService } from './categories.service';
import { faBagShopping, faBaseball, faBasketball, faComputer, faEllipsis, faGamepad, faHammer, faHand, faHeadphones, faHospital, faPizzaSlice, faSchool, faUsers, faVanShuttle, faWifi, faWrench, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Category } from '../../models/category.model';
import {
  faUtensils,
  faBus,
  faHeartbeat,
  faGraduationCap,
  faFutbol,
  faShoppingCart,
  faHome,
  faLightbulb,
  faCar,
  faPlane,
  faMoneyBillWave,
  faGasPump,
  faBriefcase,
  faMobileAlt,
  faLaptop,
  faBiking,
  faUmbrellaBeach,
  faPiggyBank,
  faCross,
  faTable,
  faShirt,
  faDesktop,
  faMotorcycle,
  faBook,
  faHandsHelping,
  faUser,
  faTruckFast
} from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryLoaderService {
  private categoriesUpdatedSource = new BehaviorSubject<void>(undefined);
  categoriesUpdated$ = this.categoriesUpdatedSource.asObservable();

  notifyCategoriesUpdate() {
    this.categoriesUpdatedSource.next();
  }

  private icons = [
    {
      title: 'Compras',
      items: [
        { name: 'cart-shopping', icon: faShoppingCart },
        { name: 'bag-shopping', icon: faBagShopping },
      ],
    },
    {
      title: 'Alimentação',
      items: [
        { name: 'utensils', icon: faUtensils },
        { name: 'pizza-slice', icon: faPizzaSlice },
      ],
    },
    {
      title: 'Transporte',
      items: [
        { name: 'car', icon: faCar },
        { name: 'motorcycle', icon: faMotorcycle },
        { name: 'bus', icon: faBus },
        { name: 'van-shuttle', icon: faVanShuttle },
        { name: 'plane', icon: faPlane },
        { name: 'truck-fast', icon: faTruckFast },
        { name: 'gas-pump', icon: faGasPump },
        { name: 'person-biking', icon: faBiking },
      ],
    },
    {
      title: 'Moradia',
      items: [
        { name: 'house', icon: faHome },
        { name: 'lightbulb', icon: faLightbulb },
        { name: 'table', icon: faTable },
      ],
    },
    {
      title: 'Saúde',
      items: [
        { name: 'heart-pulse', icon: faHeartbeat },
        { name: 'hospital', icon: faHospital },
        { name: 'cross', icon: faCross },
      ],
    },
    {
      title: 'Educação e aprendizado',
      items: [
        { name: 'graduation-cap', icon: faGraduationCap },
        { name: 'book', icon: faBook },
        { name: 'school', icon: faSchool },
      ],
    },
    {
      title: 'Trabalho e finanças',
      items: [
        { name: 'briefcase', icon: faBriefcase },
        { name: 'money-bill-wave', icon: faMoneyBillWave },
        { name: 'piggy-bank', icon: faPiggyBank },
      ],
    },
    {
      title: 'Entretenimento e lazer',
      items: [
        { name: 'futbol', icon: faFutbol },
        { name: 'basketball', icon: faBasketball },
        { name: 'umbrella-beach', icon: faUmbrellaBeach },
        { name: 'gamepad', icon: faGamepad },
        { name: 'headphones', icon: faHeadphones },
      ],
    },
    {
      title: 'Eletrônicos e tecnologia',
      items: [
        { name: 'mobile-screen-button', icon: faMobileAlt },
        { name: 'laptop', icon: faLaptop },
        { name: 'desktop', icon: faDesktop },
        { name: 'computer', icon: faComputer },
        { name: 'wifi', icon: faWifi },
      ],
    },
    {
      title: 'Moda',
      items: [{ name: 'shirt', icon: faShirt }],
    },
    {
      title: 'Ferramentas',
      items: [
        { name: 'wrench', icon: faWrench },
        { name: 'hammer', icon: faHammer },
      ],
    },
    {
      title: 'Pessoas e interações',
      items: [
        { name: 'user', icon: faUser },
        { name: 'users', icon: faUsers },
        { name: 'handshake-angle', icon: faHandsHelping },
      ],
    },
  ];

  // ...this.peopleIcons

  constructor(private categoriesService: CategoriesService) { }

  async loadCategories(): Promise<Category[]> {
    const categoriesFromDb = await this.categoriesService.getCategories();

    return Promise.all(categoriesFromDb.map(async (category) => {
      return {
        id: category.id,
        nome: category.nome,
        icone: this.getIconByName(category.icone), // Obtém o ícone diretamente pelo nome
        tipo: category.tipo
      } as Category;
    }));
  }

  async loadCategoriesByExpenses(): Promise<Category[]> {
    try {
      const allCategories = await this.categoriesService.getCategories();
      const expenseCategories = allCategories.filter(category => category.tipo === 'despesa');

      return Promise.all(expenseCategories.map(async (category) => {
        return {
          id: category.id,
          nome: category.nome,
          icone: this.getIconByName(category.icone), // Obtém o ícone diretamente pelo nome
          tipo: category.tipo
        } as Category;
      }));
    } catch (error) {
      console.error('Erro ao carregar categorias de despesas:', error);
      return []; // Retorna um array vazio em caso de erro
    }
  }

  async loadCategoriesByReceveis(): Promise<Category[]> {
    try {
      const allCategories = await this.categoriesService.getCategories();
      const expenseCategories = allCategories.filter(category => category.tipo === 'receita');

      return Promise.all(expenseCategories.map(async (category) => {
        return {
          id: category.id,
          nome: category.nome,
          icone: this.getIconByName(category.icone), // Obtém o ícone diretamente pelo nome
          tipo: category.tipo
        } as Category;
      }));
    } catch (error) {
      console.error('Erro ao carregar categorias de despesas:', error);
      return []; // Retorna um array vazio em caso de erro
    }
  }

  private getIconByName(iconName: any): IconDefinition {
    for (const category of this.icons) {
      const icon = category.items.find(item => item.name === iconName);
      if (icon) {
        return icon.icon;
      }
    }
    return faEllipsis; // Retorna ícone padrão se não encontrado
  }
  

  getIcons() {
    return this.icons;
  }
}