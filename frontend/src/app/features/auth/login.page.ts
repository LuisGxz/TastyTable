import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';

interface Demo { labelKey: string; email: string; }
const DEMO: Demo[] = [
  { labelKey: 'auth.diner', email: 'diner@tastytable.app' },
  { labelKey: 'auth.owner', email: 'owner@casabrasa.app' },
];

@Component({
  selector: 'tt-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IonContent, IonIcon, IonSpinner, TPipe],
  template: `
    <ion-content [fullscreen]="true">
      <div class="min-h-full flex flex-col px-6 pt-16 pb-8 max-w-md mx-auto">
        <div class="flex items-center gap-2.5 mb-10">
          <span class="w-9 h-9 rounded-full bg-wine-800 grid place-items-center">
            <ion-icon name="restaurant-outline" class="text-creamy-50 text-lg"></ion-icon>
          </span>
          <span class="serif3 font-semibold text-xl text-cocoa-900">TastyTable</span>
          <button (click)="i18n.toggle()" class="ml-auto text-xs font-bold rounded-full border border-creamy-200 px-3 py-1.5 text-cocoa-600 active:scale-95 transition-transform">
            {{ i18n.lang() === 'en' ? 'EN' : 'ES' }}
          </button>
        </div>

        <h1 class="serif3 text-3xl font-semibold text-cocoa-900">{{ 'auth.welcome' | t }}</h1>
        <p class="text-sm text-cocoa-600 mt-2 mb-8">{{ 'auth.subtitle' | t }}</p>

        <form (ngSubmit)="submit()" class="space-y-3">
          <div class="flex items-center gap-2 rounded-2xl bg-white border border-creamy-200 px-4 py-3.5">
            <ion-icon name="person-circle-outline" class="text-cocoa-400 text-xl"></ion-icon>
            <input name="email" type="email" autocomplete="email" required [(ngModel)]="email" [disabled]="loading()"
              class="flex-1 bg-transparent text-sm outline-none text-cocoa-900 placeholder:text-cocoa-400"
              [placeholder]="'common.email' | t" />
          </div>
          <div class="flex items-center gap-2 rounded-2xl bg-white border border-creamy-200 px-4 py-3.5">
            <ion-icon name="ticket-outline" class="text-cocoa-400 text-xl"></ion-icon>
            <input name="password" type="password" autocomplete="current-password" required [(ngModel)]="password" [disabled]="loading()"
              class="flex-1 bg-transparent text-sm outline-none text-cocoa-900 placeholder:text-cocoa-400"
              [placeholder]="'common.password' | t" />
          </div>

          @if (error()) {
            <p class="text-xs font-medium text-wine-800 bg-terra-100 rounded-xl px-3 py-2.5">{{ error() }}</p>
          }

          <button type="submit" [disabled]="loading() || !email() || !password()"
            class="w-full rounded-full bg-terra-600 text-white font-bold py-4 active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
            @if (loading()) { <ion-spinner name="crescent" class="w-5 h-5"></ion-spinner> }
            {{ loading() ? ('auth.signingIn' | t) : ('auth.signIn' | t) }}
          </button>
        </form>

        <div class="mt-10">
          <p class="text-xs font-semibold text-cocoa-400 mb-3">{{ 'auth.demoAccounts' | t }}</p>
          <div class="grid grid-cols-2 gap-3">
            @for (acc of demo; track acc.email) {
              <button type="button" (click)="useDemo(acc)" [disabled]="loading()"
                class="text-left rounded-2xl border border-creamy-200 bg-white px-4 py-3 active:scale-95 transition-transform">
                <span class="block text-sm font-bold text-cocoa-900">{{ acc.labelKey | t }}</span>
                <span class="block text-[11px] text-cocoa-400 truncate">{{ acc.email }}</span>
              </button>
            }
          </div>
        </div>

        <p class="text-center text-[11px] text-cocoa-400 mt-auto pt-10">TastyTable · book a table in seconds · Luis Chiquito Vera</p>
      </div>
    </ion-content>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly demo = DEMO;
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  useDemo(acc: Demo): void {
    this.email.set(acc.email);
    this.password.set('Taste123!');
    this.submit();
  }

  submit(): void {
    if (this.loading() || !this.email() || !this.password()) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.email(), this.password()).subscribe({
      next: () => {
        const role = this.auth.role();
        void this.router.navigateByUrl(role === 'owner' ? '/tabs/restaurant' : '/tabs/discover');
      },
      error: (err: HttpErrorResponse) => { this.loading.set(false); this.error.set(this.msg(err)); },
    });
  }

  private msg(err: HttpErrorResponse): string {
    if (err.status === 0) return this.i18n.t('error.network');
    if (err.status === 401) return this.i18n.t('error.credentials');
    return this.i18n.t('error.generic');
  }
}
