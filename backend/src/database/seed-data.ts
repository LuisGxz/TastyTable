import { PhotoStyle } from '../common/enums';

interface SeedTable { label: string; capacity: number; area: string }
interface SeedMenu { name: string; nameEs: string; price: number; photo: PhotoStyle }
export interface SeedRestaurant {
  name: string; slug: string; cuisine: string; cuisineEs: string; priceLevel: number;
  neighborhood: string; city: string; address: string; rating: number;
  description: string; descriptionEs: string; photo: PhotoStyle;
  seatingAreas: string[]; menu: SeedMenu[]; tables: SeedTable[];
  openTime: string; lastSeating: string; slotMinutes: number;
}

/** Build a spread of tables across areas: a few 2-tops, 4-tops and a couple of 6-tops. */
function tables(spec: Record<string, number[]>): SeedTable[] {
  const out: SeedTable[] = [];
  for (const [area, caps] of Object.entries(spec)) {
    const prefix = area[0].toUpperCase();
    caps.forEach((capacity, i) => out.push({ label: `${prefix}${i + 1}`, capacity, area }));
  }
  return out;
}

export const RESTAURANT_SEED: SeedRestaurant[] = [
  {
    name: 'Casa Brasa', slug: 'casa-brasa', cuisine: 'Spanish grill', cuisineEs: 'Asador español',
    priceLevel: 3, neighborhood: 'Pearl District', city: 'Portland, OR', address: '412 NW Davis St', rating: 4.7,
    description: 'Live-fire Spanish cooking — wood-grilled meats, sizzling prawns and a candlelit dining room.',
    descriptionEs: 'Cocina española a fuego vivo — carnes a la brasa, gambas al ajillo y un comedor a la luz de las velas.',
    photo: 'f-1', seatingAreas: ['Indoor', 'Patio'],
    menu: [
      { name: 'Garlic prawns', nameEs: 'Gambas al ajillo', price: 16, photo: 'f-2' },
      { name: '12-hr short rib', nameEs: 'Costilla 12 h', price: 34, photo: 'f-4' },
      { name: 'Basque cheesecake', nameEs: 'Tarta vasca', price: 11, photo: 'f-3' },
    ],
    tables: tables({ Indoor: [2, 2, 4, 4, 6], Patio: [2, 2, 4] }),
    openTime: '17:00', lastSeating: '22:00', slotMinutes: 30,
  },
  {
    name: 'Noriko Omakase', slug: 'noriko-omakase', cuisine: 'Sushi counter', cuisineEs: 'Barra de sushi',
    priceLevel: 4, neighborhood: 'Downtown', city: 'Portland, OR', address: '88 SW Ankeny St', rating: 4.9,
    description: 'An intimate omakase counter: seventeen courses of seasonal nigiri, chef’s choice.',
    descriptionEs: 'Una barra de omakase íntima: diecisiete pases de nigiri de temporada, elección del chef.',
    photo: 'f-2', seatingAreas: ['Bar', 'Indoor'],
    menu: [
      { name: 'Seasonal omakase', nameEs: 'Omakase de temporada', price: 145, photo: 'f-2' },
      { name: 'Toro flight', nameEs: 'Degustación de toro', price: 42, photo: 'f-1' },
      { name: 'Tamago', nameEs: 'Tamago', price: 9, photo: 'f-3' },
    ],
    tables: tables({ Bar: [2, 2, 2, 2], Indoor: [4, 4] }),
    openTime: '17:30', lastSeating: '21:00', slotMinutes: 30,
  },
  {
    name: 'Verde Patio', slug: 'verde-patio', cuisine: 'Veggie-forward', cuisineEs: 'Vegetal',
    priceLevel: 2, neighborhood: 'Alberta Arts', city: 'Portland, OR', address: '2310 NE Alberta St', rating: 4.5,
    description: 'Bright, plant-forward plates on a leafy garden patio — seasonal, local, generous.',
    descriptionEs: 'Platos vegetales y luminosos en un patio-jardín — de temporada, local y generoso.',
    photo: 'f-3', seatingAreas: ['Patio', 'Indoor'],
    menu: [
      { name: 'Charred broccolini', nameEs: 'Brócoli a la brasa', price: 14, photo: 'f-3' },
      { name: 'Wild mushroom toast', nameEs: 'Tosta de setas', price: 13, photo: 'f-4' },
      { name: 'Citrus pavlova', nameEs: 'Pavlova de cítricos', price: 10, photo: 'f-1' },
    ],
    tables: tables({ Patio: [2, 2, 4, 4, 6], Indoor: [2, 4] }),
    openTime: '17:00', lastSeating: '21:30', slotMinutes: 30,
  },
  {
    name: 'Ember & Oak', slug: 'ember-and-oak', cuisine: 'Steakhouse', cuisineEs: 'Asador',
    priceLevel: 3, neighborhood: 'Slabtown', city: 'Portland, OR', address: '1715 NW Thurman St', rating: 4.6,
    description: 'A modern chophouse: dry-aged steaks over oak, deep cellar, leather-and-brass bar.',
    descriptionEs: 'Un asador moderno: carnes maduradas sobre roble, gran bodega y una barra de cuero y latón.',
    photo: 'f-4', seatingAreas: ['Indoor', 'Bar'],
    menu: [
      { name: 'Dry-aged ribeye', nameEs: 'Ribeye madurado', price: 58, photo: 'f-4' },
      { name: 'Bone marrow', nameEs: 'Tuétano', price: 18, photo: 'f-1' },
      { name: 'Burnt-honey tart', nameEs: 'Tarta de miel quemada', price: 12, photo: 'f-2' },
    ],
    tables: tables({ Indoor: [2, 2, 4, 4, 4, 6], Bar: [2, 2] }),
    openTime: '17:00', lastSeating: '22:30', slotMinutes: 30,
  },
  {
    name: 'Lume Trattoria', slug: 'lume-trattoria', cuisine: 'Italian', cuisineEs: 'Italiana',
    priceLevel: 2, neighborhood: 'Hawthorne', city: 'Portland, OR', address: '3409 SE Hawthorne Blvd', rating: 4.4,
    description: 'Handmade pasta and blistered pies in a warm, family-run trattoria.',
    descriptionEs: 'Pasta artesanal y pizzas al horno en una trattoria cálida y familiar.',
    photo: 'f-1', seatingAreas: ['Indoor', 'Patio'],
    menu: [
      { name: 'Tagliatelle al ragù', nameEs: 'Tagliatelle al ragù', price: 22, photo: 'f-1' },
      { name: 'Margherita', nameEs: 'Margarita', price: 17, photo: 'f-2' },
      { name: 'Tiramisù', nameEs: 'Tiramisú', price: 10, photo: 'f-3' },
    ],
    tables: tables({ Indoor: [2, 2, 4, 4], Patio: [2, 4, 6] }),
    openTime: '16:30', lastSeating: '22:00', slotMinutes: 30,
  },
  {
    name: 'Saffron Room', slug: 'saffron-room', cuisine: 'Modern Indian', cuisineEs: 'India moderna',
    priceLevel: 2, neighborhood: 'Division', city: 'Portland, OR', address: '3120 SE Division St', rating: 4.6,
    description: 'Coastal Indian small plates and a clay-oven grill, with bright cocktails to match.',
    descriptionEs: 'Pequeños platos de India costera y parrilla de horno de barro, con cócteles luminosos.',
    photo: 'f-2', seatingAreas: ['Indoor'],
    menu: [
      { name: 'Tandoori prawns', nameEs: 'Gambas tandoori', price: 19, photo: 'f-2' },
      { name: 'Black dal', nameEs: 'Dal negro', price: 13, photo: 'f-4' },
      { name: 'Cardamom kulfi', nameEs: 'Kulfi de cardamomo', price: 9, photo: 'f-3' },
    ],
    tables: tables({ Indoor: [2, 2, 2, 4, 4, 6] }),
    openTime: '17:00', lastSeating: '21:30', slotMinutes: 30,
  },
];
