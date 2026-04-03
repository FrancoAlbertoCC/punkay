import { StoreData } from '../types';

export const DEFAULT_STORE_DATA: StoreData = {
  categories: ['Detalles', 'Joyeria', 'Relojes', 'Peluches', 'Regalos varios', 'Tomatodos'],
  products: [
    {
      id: '1',
      title: 'Collar Corazon Eterno de Plata',
      price: 89.9,
      originalPrice: 120,
      rating: 4.8,
      soldCount: 1420,
      description: 'Sorprende a esa persona especial con un collar elegante en plata sterling 925.',
      images: ['https://picsum.photos/id/64/800/800', 'https://picsum.photos/id/65/800/800'],
      category: 'Joyeria',
      options: ['Plata', 'Oro rosa'],
    },
    {
      id: '2',
      title: 'Lampara de Luna 3D Personalizada',
      price: 55,
      originalPrice: 80,
      rating: 4.9,
      soldCount: 300,
      description: 'Ilumina tus noches con una lampara lunar realista, ideal para regalos y decoracion.',
      images: ['https://picsum.photos/id/102/800/800', 'https://picsum.photos/id/103/800/800'],
      category: 'Regalos varios',
      options: ['15 cm', '20 cm'],
    },
    {
      id: '3',
      title: 'Caja Sorpresa Misteriosa',
      price: 49.9,
      originalPrice: 49.9,
      rating: 4.5,
      soldCount: 890,
      description: 'Una caja sorpresa con articulos seleccionados para regalar en cualquier ocasion.',
      images: ['https://picsum.photos/id/201/800/800'],
      category: 'Regalos varios',
      options: [],
    },
  ],
};
