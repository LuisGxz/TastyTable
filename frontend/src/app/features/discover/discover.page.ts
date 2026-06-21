import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonIcon, IonRefresher, IonRefresherContent, IonToolbar,
} from '@ionic/angular/standalone';
import { RestaurantsApi } from '../../core/api/restaurants.api';
import { DemoService } from '../../core/demo/demo.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';
import { priceTag, time12h } from '../../core/format';
import { RestaurantCard } from '../../core/models';

const CUISINES = ['Spanish', 'Sushi', 'Italian', 'Steakhouse', 'Indian', 'Veggie'];

@Component({
  selector: 'tt-discover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IonHeader, IonToolbar, IonContent, IonIcon, IonRefresher, IonRefresherContent, TPipe],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="px-4 pt-1 pb-2 flex items-end justify-between">
          <div>
            <p class="text-xs text-cocoa-400">{{ 'discover.title' | t }}</p>
            <p class="serif3 text-lg font-semibold text-cocoa-900 flex items-center gap-1">Portland, OR
              <ion-icon name="chevron-down-outline" class="text-sm text-cocoa-400"></ion-icon>
            </p>
          </div>
          <button (click)="demo.openHelp()" data-tour="help" class="w-9 h-9 rounded-full grid place-items-center text-terra-600" [attr.aria-label]="'demo.explore' | t">
            <ion-icon name="information-circle-outline" class="text-xl"></ion-icon>
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)"><ion-refresher-content></ion-refresher-content></ion-refresher>

      <div class="px-4 pb-6 max-w-xl mx-auto">
        <!-- search -->
        <div data-tour="discover-search" class="flex items-center gap-2 rounded-full bg-white border border-creamy-200 px-4 py-3 my-3 sticky top-0 z-10">
          <ion-icon name="search" class="text-cocoa-400"></ion-icon>
          <input [ngModel]="query()" (ngModelChange)="onQuery($event)"
            class="flex-1 bg-transparent text-sm outline-none text-cocoa-900 placeholder:text-cocoa-400"
            [placeholder]="'discover.search' | t" />
        </div>

        <!-- cuisine filters -->
        <div class="flex gap-2 overflow-x-auto pb-1 mb-4 text-xs font-semibold no-scrollbar">
          <button (click)="setCuisine(null)" class="shrink-0 rounded-full px-4 py-2 transition-colors"
            [class]="cuisine() === null ? 'bg-wine-800 text-creamy-50' : 'bg-white border border-creamy-200 text-cocoa-600'">{{ 'discover.all' | t }}</button>
          @for (c of cuisines; track c) {
            <button (click)="setCuisine(c)" class="shrink-0 rounded-full px-4 py-2 transition-colors"
              [class]="cuisine() === c ? 'bg-wine-800 text-creamy-50' : 'bg-white border border-creamy-200 text-cocoa-600'">{{ c }}</button>
          }
        </div>

        @switch (status()) {
          @case ('loading') {
            <div class="space-y-4">
              @for (s of [1,2,3]; track s) { <div class="h-56 rounded-3xl bg-white border border-creamy-200 animate-pulse"></div> }
            </div>
          }
          @case ('error') {
            <div class="rounded-3xl bg-white border border-creamy-200 p-10 text-center">
              <p class="text-sm text-cocoa-600">{{ 'error.network' | t }}</p>
              <button (click)="load()" class="mt-4 rounded-full border border-creamy-200 text-sm font-semibold px-5 py-2 text-terra-600">{{ 'common.retry' | t }}</button>
            </div>
          }
          @case ('ready') {
            @if (restaurants().length === 0) {
              <div class="rounded-3xl bg-white border border-creamy-200 p-12 text-center">
                <ion-icon name="restaurant-outline" class="text-3xl text-cocoa-400"></ion-icon>
                <p class="text-sm font-semibold text-cocoa-900 mt-3">{{ 'discover.empty' | t }}</p>
                <p class="text-xs text-cocoa-400 mt-1">{{ 'discover.emptyHint' | t }}</p>
              </div>
            } @else {
              <div class="space-y-4" data-tour="discover-list">
                @for (r of restaurants(); track r.id) {
                  <button (click)="open(r)" class="block w-full text-left rounded-3xl bg-white border border-creamy-200 overflow-hidden active:scale-[0.99] transition-transform">
                    <div class="h-32 relative" [class]="r.photo">
                      @if (r.availableToday) {
                        <span class="absolute top-3 left-3 flex items-center gap-1.5 bg-creamy-50/95 text-[11px] font-bold rounded-full px-3 py-1" style="color:#4F8A5B">
                          <span class="w-1.5 h-1.5 rounded-full" style="background:#4F8A5B"></span>{{ 'discover.availableTonight' | t }}
                        </span>
                      } @else {
                        <span class="absolute top-3 left-3 bg-creamy-50/95 text-cocoa-400 text-[11px] font-bold rounded-full px-3 py-1">{{ 'discover.fullyBooked' | t }}</span>
                      }
                      <span class="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold bg-creamy-50/95 rounded-full px-2.5 py-1 text-cocoa-900">
                        <ion-icon name="star" style="color:#C25E3F"></ion-icon><span class="num">{{ r.rating }}</span>
                      </span>
                    </div>
                    <div class="p-4">
                      <p class="serif3 font-semibold text-cocoa-900">{{ r.name }}</p>
                      <p class="text-xs text-cocoa-600 mb-2.5">{{ (i18n.lang() === 'es' ? r.cuisineEs : r.cuisine) }} · {{ price(r.priceLevel) }} · {{ r.neighborhood }}</p>
                      @if (r.nextSlots.length) {
                        <div class="flex gap-2">
                          @for (s of r.nextSlots; track s) {
                            <span class="rounded-full bg-terra-100 text-terra-600 text-xs font-bold num px-3.5 py-1.5">{{ t12(s) }}</span>
                          }
                        </div>
                      } @else {
                        <p class="text-xs text-cocoa-400">{{ 'discover.nextTable' | t }}</p>
                      }
                    </div>
                  </button>
                }
              </div>
            }
          }
        }
      </div>
    </ion-content>
  `,
  styles: [`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}`],
})
export class DiscoverPage implements OnInit {
  private readonly api = inject(RestaurantsApi);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);
  readonly demo = inject(DemoService);

  readonly cuisines = CUISINES;
  readonly query = signal('');
  readonly cuisine = signal<string | null>(null);
  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly restaurants = signal<RestaurantCard[]>([]);

  private debounce?: ReturnType<typeof setTimeout>;

  ngOnInit(): void { this.load(); }

  onQuery(value: string): void {
    this.query.set(value);
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.load(), 280);
  }
  setCuisine(c: string | null): void { this.cuisine.set(c); this.load(); }

  load(refresher?: { target: { complete(): void } }): void {
    if (!refresher) this.status.set('loading');
    this.api.search({ q: this.query() || undefined, cuisine: this.cuisine() ?? undefined }).subscribe({
      next: (list) => { this.restaurants.set(list); this.status.set('ready'); refresher?.target.complete(); },
      error: () => { this.status.set('error'); refresher?.target.complete(); },
    });
  }
  refresh(ev: CustomEvent): void { this.load(ev as unknown as { target: { complete(): void } }); }

  open(r: RestaurantCard): void { void this.router.navigate(['/restaurant', r.slug]); }

  price(level: number): string { return priceTag(level); }
  t12(s: string): string { return time12h(s); }
}
