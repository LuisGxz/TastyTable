import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonToolbar } from '@ionic/angular/standalone';
import { I18nService } from '../../core/i18n/i18n.service';

interface Feature { icon: string; en: [string, string]; es: [string, string]; }
interface Tier { layer: string; tech: string; }

@Component({
  selector: 'tt-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/account"></ion-back-button></ion-buttons>
        <button slot="end" (click)="i18n.toggle()" class="mr-3 text-xs font-bold rounded-full border border-creamy-200 px-3 py-1.5 text-cocoa-600">{{ i18n.lang() === 'en' ? 'EN' : 'ES' }}</button>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="px-5 py-4 pb-12 max-w-xl mx-auto">
        <div class="flex items-center gap-3 mb-3">
          <span class="w-11 h-11 rounded-full bg-wine-800 grid place-items-center"><ion-icon name="restaurant-outline" class="text-creamy-50 text-xl"></ion-icon></span>
          <div>
            <h1 class="serif3 text-2xl font-semibold text-cocoa-900">TastyTable</h1>
            <p class="text-xs text-cocoa-400">{{ es() ? 'Reservas de restaurantes' : 'Restaurant reservations' }}</p>
          </div>
        </div>
        <p class="text-sm text-cocoa-600 leading-relaxed">
          {{ es()
            ? 'Una app móvil para descubrir restaurantes y reservar mesa en segundos, con panel para el restaurante. Ionic + Angular (PWA instalable) sobre un backend NestJS + MongoDB, con un motor de disponibilidad real (mesas, zonas y franjas), auth JWT con roles comensal/restaurante, y una capa de demo guiada role-aware.'
            : 'A mobile app to discover restaurants and book a table in seconds, with a panel for the restaurant. Ionic + Angular (installable PWA) on a NestJS + MongoDB backend, with a real availability engine (tables, areas and time slots), JWT auth with diner/restaurant roles, and a role-aware guided demo layer.' }}
        </p>

        <h2 class="text-xs font-bold uppercase tracking-wide text-cocoa-400 mt-8 mb-3">{{ es() ? 'Lo destacado' : 'Highlights' }}</h2>
        <div class="grid sm:grid-cols-2 gap-3">
          @for (f of features; track f.icon) {
            <div class="rounded-2xl bg-white border border-creamy-200 p-4">
              <span class="w-9 h-9 rounded-xl bg-terra-100 grid place-items-center mb-2"><ion-icon [name]="f.icon" class="text-terra-600 text-lg"></ion-icon></span>
              <h3 class="text-sm font-semibold text-cocoa-900">{{ es() ? f.es[0] : f.en[0] }}</h3>
              <p class="text-xs text-cocoa-400 mt-0.5 leading-snug">{{ es() ? f.es[1] : f.en[1] }}</p>
            </div>
          }
        </div>

        <h2 class="text-xs font-bold uppercase tracking-wide text-cocoa-400 mt-8 mb-3">{{ es() ? 'Arquitectura' : 'Architecture' }}</h2>
        <div class="rounded-2xl bg-white border border-creamy-200 divide-y divide-creamy-100">
          @for (t of stack; track t.layer) {
            <div class="flex items-center gap-3 px-4 py-2.5">
              <span class="w-24 shrink-0 text-xs font-semibold text-cocoa-400">{{ t.layer }}</span>
              <span class="text-sm text-cocoa-900">{{ t.tech }}</span>
            </div>
          }
        </div>

        <p class="text-[11px] text-cocoa-400 mt-8 text-center">TastyTable · Luis Chiquito Vera · {{ es() ? 'demo de portfolio' : 'portfolio demo' }}</p>
      </div>
    </ion-content>
  `,
})
export class AboutPage {
  readonly i18n = inject(I18nService);
  es(): boolean { return this.i18n.lang() === 'es'; }

  readonly features: Feature[] = [
    { icon: 'search', en: ['Discover & search', 'Browse restaurants by cuisine, search and filters, with tonight’s availability on each card.'], es: ['Descubrir y buscar', 'Explora por cocina, con búsqueda, filtros y disponibilidad de hoy en cada tarjeta.'] },
    { icon: 'calendar-number-outline', en: ['Real availability', 'A booking engine over tables, areas and time slots — a table is held per slot.'], es: ['Disponibilidad real', 'Un motor de reservas sobre mesas, zonas y franjas — la mesa se ocupa por franja.'] },
    { icon: 'ticket-outline', en: ['Book to a ticket', 'Confirm a table and get a ticket with a code to show on arrival; cancel to free it.'], es: ['Reserva con ticket', 'Confirma y obtén un ticket con código para mostrar al llegar; cancela para liberarla.'] },
    { icon: 'storefront-outline', en: ['Restaurant panel', 'Owners manage tables (capacity, area) and watch incoming bookings live.'], es: ['Panel del restaurante', 'Los dueños gestionan mesas (capacidad, zona) y ven las reservas entrantes.'] },
    { icon: 'compass-outline', en: ['Guided demo', 'A role-aware tour and “How to explore” sheet, with a cross-role hint.'], es: ['Demo guiada', 'Tour role-aware y panel "Cómo explorar", con hint cross-rol.'] },
    { icon: 'sparkles-outline', en: ['Installable PWA', 'Mobile-first Ionic, EN/ES, offline-ready service worker.'], es: ['PWA instalable', 'Ionic mobile-first, EN/ES, service worker offline.'] },
  ];

  readonly stack: Tier[] = [
    { layer: 'Frontend', tech: 'Ionic 8 + Angular 20 (standalone + signals), PWA' },
    { layer: 'Backend', tech: 'NestJS 11 REST (availability engine)' },
    { layer: 'Database', tech: 'MongoDB 7 + Mongoose 9' },
    { layer: 'Auth', tech: 'JWT access + rotating refresh, diner/owner roles' },
    { layer: 'Testing', tech: '21 backend unit tests (Jest) + Playwright E2E' },
  ];
}
