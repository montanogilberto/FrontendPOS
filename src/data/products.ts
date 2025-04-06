export const products = [
  {
    id: 'el-buchon',
    name: 'El Buchón',
    description: 'Diezmillo de la mejor calidad a la plancha adicionado con aguacate fresco, además de trozos de tomate, cebolla, chile verde tatemado.',
    price: 130,
    //image: '/assets/burros.jpg',
    categoryId: 'percherones',
    options: [
      {
        id: 'tamaño',
        name: 'Tamaño',
        type: 'radio',
        choices: [
          { id: 'kid', name: 'Kid', price: -50 },
          { id: 'petit', name: 'Petit', price: -30 },
          { id: 'chico', name: 'Chico', price: 0 },
          { id: 'mediano', name: 'Mediano', price: 40 },
          { id: 'grande', name: 'Grande', price: 70 },
        ],
      },
      {
        id: 'ingredientes',
        name: 'Ingredientes',
        type: 'checkbox',
        choices: [
          { id: 'aguacate', name: 'Aguacate', price: 0 },
          { id: 'tomate', name: 'Tomate', price: 0 },
          { id: 'cebolla', name: 'Cebolla', price: 0 },
          { id: 'chile-verde', name: 'Chile Verde Tatemado', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'el-pariente',
    name: 'El Pariente',
    description: 'Carne Adobada de puerco de la mejor calidad adicionado con aguacate fresco, además de trozos de tomate, cebolla, chile verde tatemado.',
    price: 130,
    //image: '/assets/burros.jpg',
    categoryId: 'percherones',
    options: [
      {
        id: 'tamaño',
        name: 'Tamaño',
        type: 'radio',
        choices: [
          { id: 'kid', name: 'Kid', price: -50 },
          { id: 'petit', name: 'Petit', price: -30 },
          { id: 'chico', name: 'Chico', price: 0 },
          { id: 'mediano', name: 'Mediano', price: 40 },
          { id: 'grande', name: 'Grande', price: 70 },
        ],
      },
      {
        id: 'ingredientes',
        name: 'Ingredientes',
        type: 'checkbox',
        choices: [
          { id: 'aguacate', name: 'Aguacate', price: 0 },
          { id: 'tomate', name: 'Tomate', price: 0 },
          { id: 'cebolla', name: 'Cebolla', price: 0 },
          { id: 'chile-verde', name: 'Chile Verde Tatemado', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'el-ondeado',
    name: 'El Ondeado',
    description: 'Diezmillo o Adobada a la plancha, gratinado de queso, trozos de tomate, cebolla, chile verde tatemado',
    price: 130,
    //image: '/assets/burros.jpg',
    categoryId: 'percherones',
    options: [
      {
        id: 'type',
        name: 'Tipo Carne',
        type: 'radio',
        choices: [
          { id: 'diezmillo', name: 'Diezmillo', price: 0 },
          { id: 'adobada', name: 'Adobada', price: 0 },
        ],
      },
      {
        id: 'tamaño',
        name: 'Tamaño',
        type: 'radio',
        choices: [
          { id: 'kid', name: 'Kid', price: -50 },
          { id: 'petit', name: 'Petit', price: -30 },
          { id: 'chico', name: 'Chico', price: 0 },
          { id: 'mediano', name: 'Mediano', price: 40 },
          { id: 'grande', name: 'Grande', price: 70 },
        ],
      },
      {
        id: 'ingredientes',
        name: 'Ingredientes',
        type: 'checkbox',
        choices: [
          { id: 'aguacate', name: 'Aguacate', price: 0 },
          { id: 'tomate', name: 'Tomate', price: 0 },
          { id: 'cebolla', name: 'Cebolla', price: 0 },
          { id: 'chile-verde', name: 'Chile Verde Tatemado', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'la-tuneada',
    name: 'La Tuneada',
    description: 'Quesadilla Diezmillo Adobada En Tortilla PERCHERON adicionada con chile verde tatemado con una porcion de papas.',
    price: 80,
    image: '/assets/la-tuneada.jpg',
    categoryId: 'kesadillas',
    options: [
      {
        id: 'type',
        name: 'Tipo Carne',
        type: 'radio',
        choices: [
          { id: 'diezmillo', name: 'Diezmillo', price: 0 },
          { id: 'adobada', name: 'Adobada', price: 0 },
          { id: 'sin-carne', name: 'Sin Carne', price: 0 },
        ],
      },
      {
        id: 'ingredientes',
        name: 'Ingredientes',
        type: 'checkbox',
        choices: [
          { id: 'aguacate', name: 'Aguacate', price: 0 },
          { id: 'tomate', name: 'Tomate', price: 0 },
          { id: 'cebolla', name: 'Cebolla', price: 0 },
          { id: 'chile-verde', name: 'Chile Verde Tatemado', price: 0 },
          { id: 'papas', name: 'papa a la francesa', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'la-tradicional',
    name: 'La tradicional',
    description: 'Quesadilla Diezmillo o Adobada En Tortilla CHICA DOBLE adicionada con chile verde tatemado con una porcion de papas',
    price: 50,
    image: '/assets/la-tuneada.jpg',
    categoryId: 'kesadillas',
    options: [
      {
        id: 'type',
        name: 'Tipo Carne',
        type: 'radio',
        choices: [
          { id: 'diezmillo', name: 'Diezmillo', price: 0 },
          { id: 'adobada', name: 'Adobada', price: 0 },
          { id: 'sin-carne', name: 'Sin Carne', price: 0 },
        ],
      },
      {
        id: 'ingredientes',
        name: 'Ingredientes',
        type: 'checkbox',
        choices: [
          { id: 'papas', name: 'papa a la francesa', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'el-trio',
    name: 'El Trio',
    description: '3 piezas de Carne Adobada de puerco con trozos de tomate, cebolla, y chile verde tatemado.',
    price: 70,
    image: '/assets/el-trio.jpg',
    categoryId: 'tacos',
    options: [
      {
        id: 'type',
        name: 'Tipo Carne',
        type: 'radio',
        choices: [
          { id: 'diezmillo', name: 'Diezmillo', price: 0 },
          { id: 'adobada', name: 'Adobada', price: 0 },
        ],
      },
      {
        id: 'ingredientes',
        name: 'Ingredientes',
        type: 'checkbox',
        choices: [
          { id: 'aguacate', name: 'Aguacate', price: 0 },
          { id: 'tomate', name: 'Tomate', price: 0 },
          { id: 'cebolla', name: 'Cebolla', price: 0 },
          { id: 'chile-verde', name: 'Chile Verde Tatemado', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'boneless',
    name: 'Boneless',
    description: '200 gr de pechuga de pollo con papas a la francesa y aderezos Ranch y Salsa al gusto Barbecue o Buffalo.',
    price: 160,
    image: '/assets/boneless.jpg',
    categoryId: 'boneless',
    options: [
      {
        id: 'type',
        name: 'Tipo Salsa',
        type: 'radio',
        choices: [
          { id: 'barbecue', name: 'Barbecue', price: 0 },
          { id: 'buffalo', name: 'Buffalo', price: 0 },
          { id: 'sin_alsa', name: 'Sin Salsa', price: 0 },
        ],
      },
      {
        id: 'complementos',
        name: 'Complementos',
        type: 'checkbox',
        choices: [
          { id: 'ranch', name: 'Ranch', price: 0 },
          { id: 'captsup', name: 'Captsup', price: 0 },
          { id: 'papas', name: 'Papas a la fransesa', price: 0 },
        ],
      },

    ],
  },
  {
    id: 'cono-boneless',
    name: 'Cono Boneless',
    description: 'Pechuga de pollo bañada con salsa de elección (Barbecue/Buffalo/Natural), acompañada de papas a la francesa.',
    price: 150,
    image: '/assets/cono-boneless.jpg',
    categoryId: 'boneless',
    options: [
      {
        id: 'type',
        name: 'Tipo Salsa',
        type: 'radio',
        choices: [
          { id: 'barbecue', name: 'Barbecue', price: 0 },
          { id: 'buffalo', name: 'Buffalo', price: 0 },
          { id: 'natural', name: 'Natural', price: 0 },
        ],
      },
      {
        id: 'complementos',
        name: 'Complementos',
        type: 'checkbox',
        choices: [
          { id: 'ranch', name: 'Ranch', price: 0 },
          { id: 'captsup', name: 'Captsup', price: 0 },
          { id: 'papas', name: 'Papas a la fransesa', price: 0 },
        ],
      },

    ],
  },
  {
    id: 'papas-francesas',
    name: 'Orden de Papas Francesa',
    description: 'Papas a la francesa acompañadas con catsup y queso cheddar.',
    price: 70,
    image: '/assets/papas-francesas.jpg',
    categoryId: 'entradas',
    options: [
      {
        id: 'complementos',
        name: 'Complementos',
        type: 'checkbox',
        choices: [
          { id: 'queso', name: 'Queso Cheddar', price: 0 },
          { id: 'captsup', name: 'Captsup', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    description: 'Te Arizona 400 ml, Horchata, Gatorade, Fuze Tea, Jugo Kids.',
    price: 30,
    image: '/assets/bebidas.jpg',
    categoryId: 'bebidas',
    options: [      {
      id: 'type',
      name: 'bebida',
      type: 'radio',
      choices: [
        { id: 'te-arizona', name: 'TE ARIZONA', price: 0 },
        { id: 'fuze-te', name: 'FUZE TE', price: 0 },
        { id: 'jugo-kid', name: 'JUGO KIDS', price: 0 },
        { id: 'horchata', name: 'Horachata LT', price: 20 },
      ],
    }],
  },
];
