import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export interface TourStep {
  target: string | null;
  title: { en: string; es: string };
  body: { en: string; es: string };
}

const SEEN_KEY = 'tt-tour-seen';

const DINER_STEPS: TourStep[] = [
  {
    target: null,
    title: { en: 'Welcome to TastyTable', es: 'Bienvenido a TastyTable' },
    body: {
      en: 'You’re exploring as a Diner. Discover restaurants and book a table in seconds — it’s all live. Take the 20-second tour.',
      es: 'Exploras como Comensal. Descubre restaurantes y reserva en segundos — todo en vivo. Haz el tour de 20 segundos.',
    },
  },
  {
    target: '[data-tour="discover-search"]',
    title: { en: 'Find your spot', es: 'Encuentra tu sitio' },
    body: {
      en: 'Search by cuisine, restaurant or vibe, and filter by category. Cards show what’s available tonight.',
      es: 'Busca por cocina, restaurante o ambiente, y filtra por categoría. Las tarjetas muestran lo disponible hoy.',
    },
  },
  {
    target: '[data-tour="discover-list"]',
    title: { en: 'Tap to book', es: 'Toca para reservar' },
    body: {
      en: 'Open a restaurant to see its menu and pick a date, party size, area and time — availability is real.',
      es: 'Abre un restaurante para ver su menú y elegir fecha, personas, zona y hora — la disponibilidad es real.',
    },
  },
  {
    target: 'ion-tab-button[tab="reservations"]',
    title: { en: 'Your bookings', es: 'Tus reservas' },
    body: {
      en: 'Confirmed tables live here as tickets you can show on arrival — or cancel to free the table.',
      es: 'Las mesas confirmadas viven aquí como tickets para mostrar al llegar — o cancela para liberar la mesa.',
    },
  },
  {
    target: '[data-tour="help"]',
    title: { en: 'Try the other side', es: 'Prueba el otro lado' },
    body: {
      en: 'Reopen this guide here anytime. Tip: sign out and sign in as the Restaurant to manage tables and see incoming bookings.',
      es: 'Reabre esta guía aquí cuando quieras. Tip: cierra sesión y entra como Restaurante para gestionar mesas y ver reservas.',
    },
  },
];

const OWNER_STEPS: TourStep[] = [
  {
    target: null,
    title: { en: 'Welcome, Restaurant', es: 'Bienvenido, Restaurante' },
    body: {
      en: 'You’re exploring as a Restaurant. Manage your tables and watch bookings arrive. Take the quick tour.',
      es: 'Exploras como Restaurante. Gestiona tus mesas y observa llegar reservas. Haz el tour rápido.',
    },
  },
  {
    target: '[data-tour="owner-segment"]',
    title: { en: 'Tables & bookings', es: 'Mesas y reservas' },
    body: {
      en: 'Switch between your tables and the upcoming reservations diners have made.',
      es: 'Cambia entre tus mesas y las reservas próximas que han hecho los comensales.',
    },
  },
  {
    target: '[data-tour="owner-add"]',
    title: { en: 'Shape your floor', es: 'Diseña tu sala' },
    body: {
      en: 'Add, edit or remove tables — capacity and area drive what diners can book.',
      es: 'Añade, edita o quita mesas — la capacidad y la zona determinan lo que pueden reservar.',
    },
  },
  {
    target: '[data-tour="help"]',
    title: { en: 'Try the other side', es: 'Prueba el otro lado' },
    body: {
      en: 'Reopen this guide here anytime. Tip: sign out and sign in as a Diner to book a table yourself.',
      es: 'Reabre esta guía aquí cuando quieras. Tip: cierra sesión y entra como Comensal para reservar tú mismo.',
    },
  },
];

/** Role-aware guided demo: the "How to explore" sheet and the coach-mark tour. */
@Injectable({ providedIn: 'root' })
export class DemoService {
  private readonly auth = inject(AuthService);

  readonly helpOpen = signal(false);
  readonly tourActive = signal(false);
  readonly stepIndex = signal(0);

  readonly steps = computed<TourStep[]>(() => (this.auth.role() === 'owner' ? OWNER_STEPS : DINER_STEPS));

  openHelp(): void { this.helpOpen.set(true); }
  closeHelp(): void { this.helpOpen.set(false); }

  startTour(): void {
    this.helpOpen.set(false);
    this.stepIndex.set(0);
    this.tourActive.set(true);
  }
  next(): void {
    if (this.stepIndex() >= this.steps().length - 1) this.endTour();
    else this.stepIndex.update((i) => i + 1);
  }
  prev(): void { this.stepIndex.update((i) => Math.max(0, i - 1)); }
  endTour(): void { this.tourActive.set(false); this.markSeen(); }

  maybeAutoStart(): void {
    if (!this.hasSeen()) setTimeout(() => this.startTour(), 1000);
  }

  hasSeen(): boolean {
    try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
  }
  private markSeen(): void {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
  }
}
