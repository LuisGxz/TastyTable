import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController, IonContent, IonHeader, IonIcon, IonModal, IonSegment, IonSegmentButton,
  IonSpinner, IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { OwnerApi } from '../../core/api/owner.api';
import { DemoService } from '../../core/demo/demo.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';
import { fullDate, time12h } from '../../core/format';
import { OwnerRestaurant, ReservationView, TableSpec } from '../../core/models';

@Component({
  selector: 'tt-owner-restaurant',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSegment, IonSegmentButton,
    IonSpinner, IonModal, TPipe,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="serif3 font-semibold">{{ restaurant()?.name ?? 'Restaurant' }}</ion-title>
        <button slot="end" (click)="demo.openHelp()" class="mr-3 w-9 h-9 rounded-full grid place-items-center text-terra-600" [attr.aria-label]="'demo.explore' | t">
          <ion-icon name="information-circle-outline" class="text-xl"></ion-icon>
        </button>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="px-4 pt-3 pb-6 max-w-xl mx-auto">
        <ion-segment [value]="tab()" (ionChange)="tab.set($any($event.detail.value))" mode="ios" class="mb-4" data-tour="owner-segment">
          <ion-segment-button value="tables"><span class="text-sm font-semibold">{{ 'owner.tables' | t }}</span></ion-segment-button>
          <ion-segment-button value="bookings"><span class="text-sm font-semibold">{{ 'owner.bookings' | t }}</span></ion-segment-button>
        </ion-segment>

        @if (loading()) {
          <div class="space-y-3">@for (s of [1,2,3]; track s) { <div class="h-16 rounded-2xl bg-white border border-creamy-200 animate-pulse"></div> }</div>
        } @else if (error()) {
          <div class="rounded-3xl bg-white border border-creamy-200 p-10 text-center">
            <p class="text-sm text-cocoa-600">{{ 'error.network' | t }}</p>
            <button (click)="load()" class="mt-4 rounded-full border border-creamy-200 text-sm font-semibold px-5 py-2 text-terra-600">{{ 'common.retry' | t }}</button>
          </div>
        } @else if (restaurant(); as r) {
          @if (tab() === 'tables') {
            <button (click)="openForm()" data-tour="owner-add"
              class="w-full mb-3 rounded-2xl border-2 border-dashed border-terra-500/50 text-terra-600 font-semibold py-3 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform">
              <ion-icon name="add-outline" class="text-lg"></ion-icon>{{ 'owner.addTable' | t }}
            </button>
            @if (r.tables.length === 0) {
              <div class="rounded-3xl bg-white border border-creamy-200 p-10 text-center">
                <ion-icon name="restaurant-outline" class="text-3xl text-cocoa-400"></ion-icon>
                <p class="text-sm font-semibold text-cocoa-900 mt-3">{{ 'owner.noTables' | t }}</p>
                <p class="text-xs text-cocoa-400 mt-1">{{ 'owner.noTablesHint' | t }}</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (t of r.tables; track t.label) {
                  <div class="rounded-2xl bg-white border border-creamy-200 px-4 py-3 flex items-center gap-3">
                    <span class="w-11 h-11 rounded-xl bg-terra-100 text-terra-600 grid place-items-center font-bold num shrink-0">{{ t.label }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-cocoa-900">{{ t.capacity }} {{ 'owner.seats' | t }}</p>
                      <p class="text-xs text-cocoa-400">{{ t.area }}</p>
                    </div>
                    <button (click)="openForm(t)" class="w-9 h-9 rounded-full grid place-items-center text-cocoa-600 active:bg-creamy-100"><ion-icon name="create-outline"></ion-icon></button>
                    <button (click)="confirmDelete(t)" class="w-9 h-9 rounded-full grid place-items-center text-wine-800 active:bg-creamy-100"><ion-icon name="trash-outline"></ion-icon></button>
                  </div>
                }
              </div>
            }
          } @else {
            @if (bookings().length === 0) {
              <div class="rounded-3xl bg-white border border-creamy-200 p-10 text-center">
                <ion-icon name="calendar-outline" class="text-3xl text-cocoa-400"></ion-icon>
                <p class="text-sm font-semibold text-cocoa-900 mt-3">{{ 'owner.noBookings' | t }}</p>
                <p class="text-xs text-cocoa-400 mt-1">{{ 'owner.noBookingsHint' | t }}</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (b of bookings(); track b.id) {
                  <div class="rounded-2xl bg-white border border-creamy-200 px-4 py-3 flex items-center gap-3">
                    <span class="w-11 h-11 rounded-full bg-creamy-100 text-cocoa-600 grid place-items-center font-bold shrink-0">{{ initials(b.guestName) }}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-cocoa-900 truncate">{{ b.guestName }}</p>
                      <p class="text-xs text-cocoa-600 num">{{ fmtDate(b.date) }} · {{ t12(b.time) }} · {{ b.partySize }}</p>
                    </div>
                    <div class="text-right shrink-0">
                      <p class="text-xs font-bold text-terra-600 num">{{ b.tableLabel }}</p>
                      <p class="text-[11px] text-cocoa-400">{{ b.seatingArea }}</p>
                    </div>
                  </div>
                }
              </div>
            }
          }
        }
      </div>

      <!-- table form modal -->
      <ion-modal [isOpen]="formOpen()" (didDismiss)="formOpen.set(false)" [initialBreakpoint]="0.6" [breakpoints]="[0,0.6,0.9]">
        <ng-template>
          <div class="px-5 pt-6 pb-8 bg-creamy-50 min-h-full">
            <p class="serif3 text-xl font-semibold text-cocoa-900 mb-5">{{ (editing() ? 'owner.editTable' : 'owner.addTable') | t }}</p>
            <label class="block mb-3">
              <span class="text-xs font-semibold text-cocoa-400">{{ 'owner.label' | t }}</span>
              <input [(ngModel)]="fLabel" [disabled]="editing()" maxlength="6"
                class="w-full mt-1.5 rounded-2xl border border-creamy-200 bg-white px-4 py-3 text-sm outline-none focus:border-terra-500 num" placeholder="P4" />
            </label>
            <label class="block mb-3">
              <span class="text-xs font-semibold text-cocoa-400">{{ 'owner.capacity' | t }}</span>
              <div class="flex items-center gap-3 mt-1.5">
                <button (click)="fCap.set(Math.max(1, fCap()-1))" class="w-10 h-10 rounded-full bg-white border border-creamy-200 grid place-items-center"><ion-icon name="remove-outline"></ion-icon></button>
                <span class="num font-bold text-lg w-8 text-center text-cocoa-900">{{ fCap() }}</span>
                <button (click)="fCap.set(Math.min(20, fCap()+1))" class="w-10 h-10 rounded-full bg-white border border-creamy-200 grid place-items-center"><ion-icon name="add-outline"></ion-icon></button>
              </div>
            </label>
            <label class="block mb-5">
              <span class="text-xs font-semibold text-cocoa-400">{{ 'owner.area' | t }}</span>
              <div class="flex gap-2 mt-1.5 flex-wrap">
                @for (a of areas(); track a) {
                  <button (click)="fArea.set(a)" class="rounded-full px-4 py-2 text-sm font-semibold transition-colors border"
                    [class]="fArea() === a ? 'bg-wine-800 text-creamy-50 border-wine-800' : 'bg-white border-creamy-200 text-cocoa-600'">{{ a }}</button>
                }
              </div>
            </label>
            @if (formError()) { <p class="text-xs text-wine-800 bg-terra-100 rounded-xl px-3 py-2 mb-3">{{ formError() }}</p> }
            <div class="flex gap-2">
              <button (click)="formOpen.set(false)" class="flex-1 rounded-full border border-creamy-200 text-cocoa-600 font-semibold py-3.5">{{ 'common.cancel' | t }}</button>
              <button (click)="save()" [disabled]="!fLabel() || saving()"
                class="flex-1 rounded-full bg-terra-600 text-white font-bold py-3.5 disabled:opacity-40 flex items-center justify-center gap-2">
                @if (saving()) { <ion-spinner name="crescent" class="w-5 h-5"></ion-spinner> } {{ 'common.save' | t }}
              </button>
            </div>
          </div>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
})
export class OwnerRestaurantPage implements OnInit {
  protected readonly Math = Math;
  private readonly api = inject(OwnerApi);
  private readonly alertCtrl = inject(AlertController);
  readonly i18n = inject(I18nService);
  readonly demo = inject(DemoService);

  readonly tab = signal<'tables' | 'bookings'>('tables');
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly restaurant = signal<OwnerRestaurant | null>(null);
  readonly bookings = signal<ReservationView[]>([]);

  readonly formOpen = signal(false);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly fLabel = signal('');
  readonly fCap = signal(2);
  readonly fArea = signal('Indoor');
  readonly areas = computed(() => {
    const base = this.restaurant()?.seatingAreas ?? ['Indoor'];
    return Array.from(new Set([...base, 'Indoor', 'Patio', 'Bar']));
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.restaurant().subscribe({
      next: (r) => { this.restaurant.set(r); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
    this.api.reservations().subscribe({ next: (b) => this.bookings.set(b), error: () => {} });
  }

  openForm(table?: TableSpec): void {
    this.formError.set(null);
    if (table) {
      this.editing.set(true);
      this.fLabel.set(table.label); this.fCap.set(table.capacity); this.fArea.set(table.area);
    } else {
      this.editing.set(false);
      this.fLabel.set(''); this.fCap.set(2); this.fArea.set(this.areas()[0]);
    }
    this.formOpen.set(true);
  }

  save(): void {
    const table: TableSpec = { label: this.fLabel().trim(), capacity: this.fCap(), area: this.fArea() };
    if (!table.label || this.saving()) return;
    this.saving.set(true);
    this.formError.set(null);
    const req = this.editing() ? this.api.updateTable(table.label, table) : this.api.addTable(table);
    req.subscribe({
      next: (r) => { this.restaurant.set(r); this.saving.set(false); this.formOpen.set(false); },
      error: (e) => { this.saving.set(false); this.formError.set(e?.error?.message ?? this.i18n.t('error.generic')); },
    });
  }

  async confirmDelete(table: TableSpec): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: this.i18n.t('owner.deleteTable'),
      message: this.i18n.t('owner.deleteMsg'),
      buttons: [
        { text: this.i18n.t('common.cancel'), role: 'cancel' },
        { text: this.i18n.t('owner.remove'), role: 'destructive', handler: () => this.remove(table) },
      ],
    });
    await alert.present();
  }
  private remove(table: TableSpec): void {
    this.api.removeTable(table.label).subscribe({ next: (r) => this.restaurant.set(r), error: () => {} });
  }

  initials(name: string): string { return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(); }
  fmtDate(date: string): string { return fullDate(date, this.i18n.lang()); }
  t12(time: string): string { return time12h(time); }
}
