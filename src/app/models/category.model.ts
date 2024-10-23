import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export interface Category {
  id: number; // ou string, dependendo do tipo de ID que você está usando
  nome: string;
  icone: IconDefinition;
  tipo: string;
}

  