import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBackButton, IonButtons, IonContent, IonIcon, IonModal, IonSpinner,
} from '@ionic/angular/standalone';
import { RestaurantsApi } from '../../core/api/restaurants.api';
import { ReservationsApi } from '../../core/api/reservations.api';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';
import { dayLabel, nextDays, priceTag, time12h } from '../../core/format';
import { RestaurantDetail, ReservationView, SlotAvailability } from '../../core/models';
import { TicketComponent } from '../../shared/ticket.component';

@Component({
  selector: 'tt-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonButtons, IonBackButton, IonContent, IonIcon, IonSpinner, IonModal,
    TPipe, TicketComponent,
  ],
  template: `
    <ion-content [fullscreen]="true">
      @switch (status()) {
        @case ('loading') {
          <div class="h-48 f-1 animate-pulse"></div>
          <div class="px-5 py-5 space-y-3"><div class="h-6 w-2/3 bg-creamy-100 rounded animate-pulse"></div><div class="h-4 w-1/2 bg-creamy-100 rounded animate-pulse"></div></div>
        }
        @case ('error') {
          <div class="px-5 py-20 text-center"><p class="text-sm text-cocoa-600">{{ 'error.network' | t }}</p>
            <button (click)="load()" class="mt-4 rounded-full border border-creamy-200 text-sm font-semibold px-5 py-2 text-terra-600">{{ 'common.retry' | t }}</button></div>
        }
        @case ('ready') {
          @if (detail(); as d) {
            <!-- hero -->
            <div class="h-52 relative" [class]="d.photo">
              <div class="absolute top-0 inset-x-0 px-4 pt-3 flex justify-between">
                <ion-buttons><ion-back-button defaultHref="/tabs/discover" class="bg-creamy-50/90 rounded-full"></ion-back-button></ion-buttons>
                <button (click)="saved.set(!saved())" class="w-10 h-10 rounded-full bg-creamy-50/90 grid place-items-center active:scale-90 transition-transform">
                  <ion-icon [name]="saved() ? 'heart' : 'heart-outline'" [style.color]="saved() ? '#C25E3F' : '#6B5A4E'"></ion-icon>
                </button>
              </div>
            </div>

            <div class="px-5 py-4 pb-32 max-w-xl mx-auto">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h1 class="serif3 text-2xl font-semibold text-cocoa-900">{{ d.name }}</h1>
                  <p class="text-xs text-cocoa-600 mt-0.5">{{ (i18n.lang() === 'es' ? d.cuisineEs : d.cuisine) }} · {{ price(d.priceLevel) }} · {{ d.neighborhood }}</p>
                </div>
                <span class="flex items-center gap-1 text-sm font-bold bg-creamy-100 rounded-full px-2.5 py-1 text-cocoa-900 shrink-0"><ion-icon name="star" style="color:#C25E3F"></ion-icon><span class="num">{{ d.rating }}</span></span>
              </div>
              <p class="text-sm text-cocoa-600 mt-3 leading-relaxed">{{ i18n.lang() === 'es' ? d.descriptionEs : d.description }}</p>
              <p class="text-xs text-cocoa-400 mt-2 flex items-center gap-1"><ion-icon name="location-outline"></ion-icon>{{ d.address }}</p>

              <!-- menu -->
              @if (d.menu.length) {
                <p class="text-xs font-bold uppercase tracking-wide text-cocoa-400 mt-6 mb-2">{{ 'detail.fromMenu' | t }}</p>
                <div class="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
                  @for (m of d.menu; track m.name) {
                    <div class="shrink-0 w-32">
                      <div class="h-20 rounded-xl" [class]="m.photo"></div>
                      <p class="text-xs font-semibold mt-1.5 text-cocoa-900">{{ i18n.lang() === 'es' ? m.nameEs : m.name }}</p>
                      <p class="text-[11px] text-cocoa-400 num">\${{ m.price }}</p>
                    </div>
                  }
                </div>
              }

              <!-- booking selector -->
              <p class="text-xs font-bold uppercase tracking-wide text-cocoa-400 mt-7 mb-2">{{ 'detail.bookTable' | t }}</p>

              <!-- date chips -->
              <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar mb-3">
                @for (day of days; track day) {
                  <button (click)="pickDate(day)" class="shrink-0 rounded-2xl px-3.5 py-2 text-center transition-colors border"
                    [class]="day === date() ? 'bg-wine-800 text-creamy-50 border-wine-800' : 'bg-white border-creamy-200 text-cocoa-900'">
                    <span class="block text-[11px] font-semibold">{{ dayLabel(day).label }}</span>
                    <span class="block text-[10px] num" [class]="day === date() ? 'text-creamy-50/70' : 'text-cocoa-400'">{{ dayLabel(day).sub }}</span>
                  </button>
                }
              </div>

              <!-- party + area -->
              <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="rounded-2xl border border-creamy-200 bg-white px-3 py-2.5 flex items-center justify-between">
                  <span class="text-xs text-cocoa-400">{{ 'detail.party' | t }}</span>
                  <span class="flex items-center gap-2">
                    <button (click)="changeParty(-1)" class="w-7 h-7 rounded-full bg-creamy-100 grid place-items-center active:scale-90 transition-transform"><ion-icon name="remove-outline" class="text-cocoa-600"></ion-icon></button>
                    <span class="num font-bold text-sm w-4 text-center text-cocoa-900">{{ party() }}</span>
                    <button (click)="changeParty(1)" class="w-7 h-7 rounded-full bg-creamy-100 grid place-items-center active:scale-90 transition-transform"><ion-icon name="add-outline" class="text-cocoa-600"></ion-icon></button>
                  </span>
                </div>
                <button (click)="cycleArea(d)" class="rounded-2xl border border-creamy-200 bg-white px-3 py-2.5 flex items-center justify-between">
                  <span class="text-xs text-cocoa-400">{{ 'detail.seating' | t }}</span>
                  <span class="text-sm font-semibold text-cocoa-900">{{ area() ?? ('detail.anyArea' | t) }}</span>
                </button>
              </div>

              <!-- time slots -->
              @if (availLoading()) {
                <div class="py-6 text-center"><ion-spinner name="crescent" class="text-terra-600"></ion-spinner></div>
              } @else if (anyAvailable()) {
                <div class="grid grid-cols-4 gap-2">
                  @for (s of availability(); track s.time) {
                    <button [disabled]="!s.available" (click)="pickTime(s.time)"
                      class="rounded-full py-2.5 text-sm font-bold num transition-colors border"
                      [class]="slotClass(s)">{{ t12(s.time) }}</button>
                  }
                </div>
              } @else {
                <p class="text-sm text-cocoa-400 text-center py-6">{{ 'detail.noTimes' | t }}</p>
              }
            </div>

            <!-- confirm bar -->
            <div class="fixed bottom-0 inset-x-0 px-5 py-4 bg-creamy-50/95 backdrop-blur border-t border-creamy-200 max-w-xl mx-auto">
              <button (click)="confirm(d)" [disabled]="!time() || booking()"
                class="w-full rounded-full bg-terra-600 text-white font-bold py-4 active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-2">
                @if (booking()) { <ion-spinner name="crescent" class="w-5 h-5"></ion-spinner>{{ 'detail.booking' | t }} }
                @else { {{ 'detail.confirm' | t }}@if (time()) { · {{ t12(time()!) }} · {{ party() }} } }
              </button>
            </div>
          }
        }
      }

      <!-- ticket modal -->
      <ion-modal [isOpen]="!!created()" (didDismiss)="created.set(null)" [initialBreakpoint]="1" [breakpoints]="[0,1]">
        <ng-template>
          @if (created(); as res) {
            <tt-ticket [r]="res" (done)="closeTicket()" (viewReservations)="goReservations()"></tt-ticket>
          }
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}`],
})
export class DetailPage implements OnInit {
  readonly slug = input.required<string>();

  private readonly api = inject(RestaurantsApi);
  private readonly reservationsApi = inject(ReservationsApi);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly detail = signal<RestaurantDetail | null>(null);
  readonly saved = signal(false);

  readonly days = nextDays(14);
  readonly date = signal(this.days[0]);
  readonly party = signal(2);
  readonly area = signal<string | null>(null);

  readonly availability = signal<SlotAvailability[]>([]);
  readonly availLoading = signal(false);
  readonly time = signal<string | null>(null);
  readonly anyAvailable = computed(() => this.availability().some((s) => s.available));

  readonly booking = signal(false);
  readonly created = signal<ReservationView | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.status.set('loading');
    this.api.detail(this.slug()).subscribe({
      next: (d) => { this.detail.set(d); this.status.set('ready'); this.loadAvailability(); },
      error: () => this.status.set('error'),
    });
  }

  private loadAvailability(): void {
    this.time.set(null);
    this.availLoading.set(true);
    this.api.availability(this.slug(), { date: this.date(), party: this.party(), area: this.area() ?? undefined }).subscribe({
      next: (res) => { this.availability.set(res.slots); this.availLoading.set(false); },
      error: () => { this.availability.set([]); this.availLoading.set(false); },
    });
  }

  pickDate(day: string): void { this.date.set(day); this.loadAvailability(); }
  changeParty(delta: number): void {
    this.party.set(Math.max(1, Math.min(10, this.party() + delta)));
    this.loadAvailability();
  }
  cycleArea(d: RestaurantDetail): void {
    const options = [null, ...d.seatingAreas];
    const idx = options.indexOf(this.area());
    this.area.set(options[(idx + 1) % options.length]);
    this.loadAvailability();
  }
  pickTime(time: string): void { this.time.set(time); }

  confirm(d: RestaurantDetail): void {
    const time = this.time();
    if (!time || this.booking()) return;
    this.booking.set(true);
    this.reservationsApi.create({
      restaurantId: d.id, date: this.date(), time, partySize: this.party(),
      seatingArea: this.area() ?? undefined,
    }).subscribe({
      next: (res) => { this.booking.set(false); this.created.set(res); },
      error: () => { this.booking.set(false); this.loadAvailability(); },
    });
  }

  closeTicket(): void { this.created.set(null); }
  goReservations(): void { this.created.set(null); void this.router.navigateByUrl('/tabs/reservations'); }

  // view helpers
  dayLabel(day: string) { return dayLabel(day, this.i18n.lang()); }
  price(level: number): string { return priceTag(level); }
  t12(s: string): string { return time12h(s); }
  slotClass(s: SlotAvailability): string {
    if (!s.available) return 'border-creamy-200 text-cocoa-400 opacity-40 line-through';
    return s.time === this.time() ? 'bg-wine-800 text-creamy-50 border-wine-800' : 'bg-white border-creamy-200 text-cocoa-900';
  }
}
