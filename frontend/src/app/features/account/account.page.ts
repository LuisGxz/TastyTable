import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { DemoService } from '../../core/demo/demo.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';

@Component({
  selector: 'tt-account',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, TPipe],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="serif3 font-semibold">{{ 'account.title' | t }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="px-5 py-4 max-w-md mx-auto">
        @if (auth.user(); as u) {
          <div class="rounded-3xl bg-white border border-creamy-200 p-5 flex items-center gap-4">
            <span class="w-14 h-14 rounded-full bg-terra-100 text-terra-600 grid place-items-center text-lg font-bold">{{ initials(u.name) }}</span>
            <div class="min-w-0">
              <p class="serif3 text-lg font-semibold text-cocoa-900 truncate">{{ u.name }}</p>
              <p class="text-xs text-cocoa-400 truncate">{{ u.email }}</p>
              <span class="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5"
                [class]="u.role === 'owner' ? 'bg-wine-800 text-creamy-50' : 'bg-terra-100 text-terra-600'">
                {{ (u.role === 'owner' ? 'auth.owner' : 'auth.diner') | t }}
              </span>
            </div>
          </div>

          <div class="mt-4 rounded-3xl bg-white border border-creamy-200 divide-y divide-creamy-100">
            <button (click)="demo.openHelp()" class="w-full flex items-center gap-3 px-5 py-4 active:bg-creamy-50 transition-colors">
              <ion-icon name="compass-outline" class="text-terra-600 text-xl"></ion-icon>
              <span class="text-sm font-medium text-cocoa-900">{{ 'demo.explore' | t }}</span>
              <ion-icon name="chevron-forward-outline" class="ml-auto text-cocoa-400"></ion-icon>
            </button>
            <button (click)="i18n.toggle()" class="w-full flex items-center gap-3 px-5 py-4 active:bg-creamy-50 transition-colors">
              <ion-icon name="language-outline" class="text-cocoa-600 text-xl"></ion-icon>
              <span class="text-sm font-medium text-cocoa-900">{{ 'account.language' | t }}</span>
              <span class="ml-auto text-xs font-bold text-terra-600">{{ i18n.lang() === 'en' ? 'English' : 'Español' }}</span>
            </button>
            <button (click)="goAbout()" class="w-full flex items-center gap-3 px-5 py-4 active:bg-creamy-50 transition-colors">
              <ion-icon name="information-circle-outline" class="text-cocoa-600 text-xl"></ion-icon>
              <span class="text-sm font-medium text-cocoa-900">{{ 'account.about' | t }}</span>
              <ion-icon name="chevron-forward-outline" class="ml-auto text-cocoa-400"></ion-icon>
            </button>
            <button (click)="signOut()" class="w-full flex items-center gap-3 px-5 py-4 active:bg-creamy-50 transition-colors">
              <ion-icon name="log-out-outline" class="text-wine-800 text-xl"></ion-icon>
              <span class="text-sm font-medium text-wine-800">{{ 'auth.signOut' | t }}</span>
            </button>
          </div>
        }

        <p class="text-center text-[11px] text-cocoa-400 mt-8">TastyTable · Luis Chiquito Vera</p>
      </div>
    </ion-content>
  `,
})
export class AccountPage {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly demo = inject(DemoService);
  private readonly router = inject(Router);

  initials(name: string): string {
    return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  }
  goAbout(): void { void this.router.navigateByUrl('/about'); }
  signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
