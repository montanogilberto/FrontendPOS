//type_products.ts

export interface Choice {
    id: string;
    name: string;
    price: number;
  }
  
  export interface Option {
    id: string;
    name: string;
    type: 'radio' | 'checkbox';
    choices: Choice[];
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    categoryId: number;
    options: Option[];
  }
  