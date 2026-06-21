import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { I18nService } from '../core/i18n/i18n.service';
import { TPipe } from '../core/i18n/t.pipe';
import { fullDate, time12h } from '../core/format';
import { ReservationView } from '../core/models';

/** The confirmation "ticket" — a perforated stub with a barcode and code. Reused by booking + history. */
@Component({
  selector: 'tt-ticket',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, TPipe],
  template: `
    <div class="bg-wine-900 min-h-full px-5 pt-8 pb-6 text-center flex flex-col">
      @if (celebrate()) {
        <div class="w-14 h-14 mx-auto rounded-full bg-avail grid place-items-center my-4 shadow-[0_0_0_8px_rgba(79,138,91,.18)]">
          <ion-icon name="checkmark-circle" class="text-white text-3xl"></ion-icon>
        </div>
        <h2 class="serif3 text-2xl font-semibold text-creamy-50">{{ 'ticket.confirmed' | t }}</h2>
        <p class="text-xs text-creamy-50/60 mb-5">{{ 'ticket.seeYou' | t }} {{ firstName() }}.</p>
      }

      <!-- ticket -->
      <div class="bg-creamy-50 rounded-2xl text-left overflow-hidden mt-2">
        <div class="p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="min-w-0">
              <p class="serif3 font-semibold text-lg text-cocoa-900 truncate">{{ r().restaurantName }}</p>
              @if (r().address) { <p class="text-xs text-cocoa-600">{{ r().address }}</p> }
            </div>
            <span class="w-10 h-10 rounded-full bg-terra-100 grid place-items-center shrink-0"><ion-icon name="restaurant-outline" class="text-terra-600"></ion-icon></span>
          </div>
          <div class="grid grid-cols-3 gap-3 text-center">
            <div><p class="text-[10px] uppercase tracking-wide text-cocoa-400">{{ 'detail.date' | t }}</p><p class="font-bold text-sm num text-cocoa-900">{{ date() }}</p></div>
            <div><p class="text-[10px] uppercase tracking-wide text-cocoa-400">{{ 'ticket.time' | t }}</p><p class="font-bold text-sm num text-cocoa-900">{{ time() }}</p></div>
            <div><p class="text-[10px] uppercase tracking-wide text-cocoa-400">{{ 'detail.party' | t }}</p><p class="font-bold text-sm num text-cocoa-900">{{ r().partySize }}</p></div>
          </div>
        </div>
        <!-- perforation -->
        <div class="relative h-6 flex items-center">
          <span class="absolute -left-3 w-6 h-6 rounded-full bg-wine-900"></span>
          <span class="flex-1 border-t-2 border-dashed border-creamy-200 mx-4"></span>
          <span class="absolute -right-3 w-6 h-6 rounded-full bg-wine-900"></span>
        </div>
        <div class="px-5 pb-5 flex items-center gap-4">
          <div class="flex items-end gap-[2px] h-10">
            @for (b of bars; track $index) { <span class="bg-cocoa-900" [style.width.px]="b.w" [style.height.%]="b.h"></span> }
          </div>
          <div class="text-left">
            <p class="num text-xs font-bold text-cocoa-900">{{ r().code }}</p>
            <p class="text-[11px] text-cocoa-400">{{ 'ticket.show' | t }}</p>
          </div>
        </div>
      </div>

      <div class="mt-auto pt-6 space-y-2">
        @if (celebrate()) {
          <button (click)="viewReservations.emit()" class="w-full rounded-full bg-terra-600 text-white font-bold py-3.5 active:scale-[0.98] transition-transform">{{ 'ticket.viewReservations' | t }}</button>
        }
        <button (click)="done.emit()" class="w-full rounded-full border border-creamy-50/25 text-creamy-50 text-sm font-bold py-3.5 active:scale-[0.98] transition-transform">{{ (celebrate() ? 'ticket.done' : 'common.close') | t }}</button>
      </div>
    </div>
  `,
})
export class TicketComponent {
  private readonly i18n = inject(I18nService);
  readonly r = input.required<ReservationView>();
  readonly celebrate = input<boolean>(true);
  readonly done = output<void>();
  readonly viewReservations = output<void>();

  readonly bars = [3, 2, 4, 2, 3, 5, 2, 3, 4, 2, 3, 2, 4].map((w, i) => ({ w, h: [100, 75, 100, 66, 100, 80, 100, 60, 100, 80, 100, 66, 100][i] }));

  firstName(): string { return this.r().guestName.split(' ')[0]; }
  date(): string { return fullDate(this.r().date, this.i18n.lang()); }
  time(): string { return time12h(this.r().time); }
}
