import { Injectable } from '@angular/core';
import { CategoriesService } from './categories.service';
import { faEllipsis, faHand, IconDefinition } from '@fortawesome/free-solid-svg-icons';
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
  faHandsHelping
} from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class CategoryLoaderService {
  private icons: { name: string, icon: IconDefinition }[] = [
    { name: 'utensils', icon: faUtensils },
    { name: 'bus', icon: faBus },
    { name: 'heart-pulse', icon: faHeartbeat },
    { name: 'graduation-cap', icon: faGraduationCap },
    { name: 'futbol', icon: faFutbol },
    { name: 'cart-shopping', icon: faShoppingCart },
    { name: 'house', icon: faHome },
    { name: 'lightbulb', icon: faLightbulb },
    { name: 'car', icon: faCar },
    { name: 'plane', icon: faPlane },
    { name: 'money-bill-wave', icon: faMoneyBillWave },
    { name: 'gas-pump', icon: faGasPump },
    { name: 'briefcase', icon: faBriefcase },
    { name: 'mobile-screen-button', icon: faMobileAlt },
    { name: 'laptop', icon: faLaptop },
    { name: 'person-biking', icon: faBiking },
    { name: 'umbrella-beach', icon: faUmbrellaBeach },
    { name: 'piggy-bank', icon: faPiggyBank },
    { name: 'book', icon: faBook },
    { name: 'motorcycle', icon: faMotorcycle },
    { name: 'desktop', icon: faDesktop },
    { name: 'shirt', icon: faShirt },
    { name: 'table', icon: faTable },
    { name: 'cross', icon: faCross },
    { name: 'handshake-angle', icon: faHandsHelping },
];
  constructor(private categoriesService: CategoriesService) {}

  async loadCategories(): Promise<Category[]> {
    const categoriesFromDb = await this.categoriesService.getCategories();

    console.log("categoriesFromDb", JSON.stringify(categoriesFromDb));
    

    return Promise.all(categoriesFromDb.map(async (category) => {
      return {
        id: category.id,
        nome: category.nome,
        icone: this.getIconByName(category.icone), // Obtém o ícone diretamente pelo nome
        tipo: category.tipo
      } as Category;
    }));
  }

  private getIconByName(iconName: any): IconDefinition {
    const icon = this.icons.find(item => item.name === iconName);
    return icon ? icon.icon : faEllipsis; // Retorna ícone padrão se não encontrado
  }

  getIcons(): { icon: IconDefinition }[] {
    return this.icons;
  }
}
