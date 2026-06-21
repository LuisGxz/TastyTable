import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController, IonContent, IonHeader, IonIcon, IonModal, IonSegment, IonSegmentButton,
  IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { ReservationsApi } from '../../core/api/reservations.api';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';
import { fullDate, time12h } from '../../core/format';
import { ReservationView } from '../../core/models';
import { TicketComponent } from '../../shared/ticket.component';

@Component({
  selector: 'tt-reservations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSegment, IonSegmentButton,
    IonModal, TPipe, TicketComponent,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar><ion-title class="serif3 font-semibold">{{ 'reservations.title' | t }}</ion-title></ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="px-4 pt-3 pb-6 max-w-xl mx-auto">
        <ion-segment [value]="tab()" (ionChange)="tab.set($any($event.detail.value))" mode="ios" class="mb-4">
          <ion-segment-button value="upcoming"><span class="text-sm font-semibold">{{ 'reservations.upcoming' | t }}</span></ion-segment-button>
          <ion-segment-button value="past"><span class="text-sm font-semibold">{{ 'reservations.past' | t }}</span></ion-segment-button>
        </ion-segment>

        @switch (status()) {
          @case ('loading') {
            <div class="space-y-3">@for (s of [1,2,3]; track s) { <div class="h-24 rounded-3xl bg-white border border-creamy-200 animate-pulse"></div> }</div>
          }
          @case ('error') {
            <div class="rounded-3xl bg-white border border-creamy-200 p-10 text-center">
              <p class="text-sm text-cocoa-600">{{ 'error.network' | t }}</p>
              <button (click)="load()" class="mt-4 rounded-full border border-creamy-200 text-sm font-semibold px-5 py-2 text-terra-600">{{ 'common.retry' | t }}</button>
            </div>
          }
          @case ('ready') {
            @if (list().length === 0) {
              <div class="rounded-3xl bg-white border border-creamy-200 p-12 text-center">
                <ion-icon [name]="tab() === 'upcoming' ? 'calendar-outline' : 'time-outline'" class="text-3xl text-cocoa-400"></ion-icon>
                <p class="text-sm font-semibold text-cocoa-900 mt-3">{{ (tab() === 'upcoming' ? 'reservations.empty' : 'reservations.emptyPast') | t }}</p>
                <p class="text-xs text-cocoa-400 mt-1">{{ (tab() === 'upcoming' ? 'reservations.emptyHint' : 'reservations.emptyPastHint') | t }}</p>
                @if (tab() === 'upcoming') {
                  <button (click)="goDiscover()" class="mt-4 rounded-full bg-terra-600 text-white text-sm font-bold px-5 py-2.5">{{ 'reservations.findTable' | t }}</button>
                }
              </div>
            } @else {
              <div class="space-y-3">
                @for (r of list(); track r.id) {
                  <div class="rounded-3xl bg-white border border-creamy-200 overflow-hidden" [class.opacity-70]="tab() === 'past'">
                    <div class="flex items-stretch">
                      <div class="w-2 shrink-0" [class]="r.photo ?? 'f-1'"></div>
                      <div class="flex-1 min-w-0 p-4">
                        <div class="flex items-start justify-between gap-2">
                          <p class="serif3 font-semibold text-cocoa-900 truncate">{{ r.restaurantName }}</p>
                          <span class="text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 shrink-0" [class]="statusClass(r)">{{ ('status.' + r.status) | t }}</span>
                        </div>
                        <p class="text-xs text-cocoa-600 mt-1 num">{{ fmtDate(r.date) }} · {{ t12(r.time) }} · {{ 'reservations.partyOf' | t }} {{ r.partySize }}</p>
                        <p class="text-[11px] text-cocoa-400 mt-0.5">{{ r.seatingArea }} · {{ r.code }}</p>

                        @if (r.status === 'confirmed' && !r.isPast) {
                          <div class="flex gap-2 mt-3">
                            <button (click)="openTicket(r)" class="flex-1 rounded-full bg-terra-100 text-terra-600 text-xs font-bold py-2 active:scale-95 transition-transform">{{ 'reservations.viewTicket' | t }}</button>
                            <button (click)="confirmCancel(r)" class="rounded-full border border-creamy-200 text-cocoa-600 text-xs font-bold px-4 py-2 active:scale-95 transition-transform">{{ 'reservations.cancel' | t }}</button>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }
        }
      </div>

      <ion-modal [isOpen]="!!ticket()" (didDismiss)="ticket.set(null)" [initialBreakpoint]="1" [breakpoints]="[0,1]">
        <ng-template>
          @if (ticket(); as res) { <tt-ticket [r]="res" [celebrate]="false" (done)="ticket.set(null)"></tt-ticket> }
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
})
export class ReservationsPage implements OnInit {
  private readonly api = inject(ReservationsApi);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);
  readonly i18n = inject(I18nService);

  readonly tab = signal<'upcoming' | 'past'>('upcoming');
  readonly status = signal<'loading' | 'error' | 'ready'>('loading');
  readonly upcoming = signal<ReservationView[]>([]);
  readonly past = signal<ReservationView[]>([]);
  readonly ticket = signal<ReservationView | null>(null);

  readonly list = computed(() => (this.tab() === 'upcoming' ? this.upcoming() : this.past()));

  ngOnInit(): void { this.load(); }

  load(): void {
    this.status.set('loading');
    this.api.mine().subscribe({
      next: (res) => { this.upcoming.set(res.upcoming); this.past.set(res.past); this.status.set('ready'); },
      error: () => this.status.set('error'),
    });
  }

  openTicket(r: ReservationView): void { this.ticket.set(r); }
  goDiscover(): void { void this.router.navigateByUrl('/tabs/discover'); }

  async confirmCancel(r: ReservationView): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: this.i18n.t('reservations.cancelTitle'),
      message: this.i18n.t('reservations.cancelMsg'),
      buttons: [
        { text: this.i18n.t('reservations.keepIt'), role: 'cancel' },
        { text: this.i18n.t('reservations.cancel'), role: 'destructive', handler: () => this.cancel(r) },
      ],
    });
    await alert.present();
  }

  private cancel(r: ReservationView): void {
    this.api.cancel(r.id).subscribe({ next: () => this.load(), error: () => this.load() });
  }

  fmtDate(date: string): string { return fullDate(date, this.i18n.lang()); }
  t12(time: string): string { return time12h(time); }
  statusClass(r: ReservationView): string {
    if (r.status === 'cancelled') return 'bg-creamy-100 text-cocoa-400';
    if (r.status === 'completed') return 'bg-creamy-100 text-cocoa-600';
    return 'bg-[#e4f0e6] text-avail';
  }
}
