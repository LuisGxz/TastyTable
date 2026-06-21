import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonIcon, IonModal } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { DemoService } from '../../core/demo/demo.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';

/** "How to explore" slide-up sheet: what's real, role context, and the cross-role hint. */
@Component({
  selector: 'tt-help-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonModal, IonIcon, TPipe],
  template: `
    <ion-modal [isOpen]="demo.helpOpen()" (didDismiss)="demo.closeHelp()" [initialBreakpoint]="0.9" [breakpoints]="[0,0.9,1]">
      <ng-template>
        <div class="bg-creamy-50 min-h-full px-5 pt-6 pb-10">
          <div class="flex items-center gap-2.5 mb-1">
            <span class="w-8 h-8 rounded-full bg-wine-800 grid place-items-center"><ion-icon name="compass-outline" class="text-creamy-50"></ion-icon></span>
            <h2 class="serif3 text-xl font-semibold text-cocoa-900">{{ 'demo.explore' | t }}</h2>
            <button (click)="demo.closeHelp()" class="ml-auto w-8 h-8 rounded-full grid place-items-center text-cocoa-400"><ion-icon name="close-outline" class="text-xl"></ion-icon></button>
          </div>

          <span class="inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-2.5 py-1 mb-3"
            [class]="isOwner() ? 'bg-wine-800 text-creamy-50' : 'bg-terra-100 text-terra-600'">
            <ion-icon name="sparkles-outline"></ion-icon>{{ (isOwner() ? 'demo.role.owner' : 'demo.role.diner') | t }}
          </span>

          <p class="text-sm text-cocoa-600 leading-relaxed">{{ 'demo.intro' | t }}</p>

          <button (click)="demo.startTour()" class="w-full mt-4 rounded-full bg-terra-600 text-white font-bold py-3 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <ion-icon name="play-outline"></ion-icon>{{ 'demo.startTour' | t }}
          </button>

          <h3 class="text-xs font-bold uppercase tracking-wide text-cocoa-400 mt-6 mb-2">{{ 'demo.whatsReal' | t }}</h3>
          <ul class="space-y-2">
            @for (k of realKeys; track k) {
              <li class="flex items-start gap-2.5 text-sm text-cocoa-900">
                <ion-icon name="checkmark-circle" class="text-avail text-lg shrink-0 mt-0.5"></ion-icon><span>{{ k | t }}</span>
              </li>
            }
          </ul>

          <div class="mt-6 rounded-2xl bg-terra-100/60 border border-terra-500/20 p-4">
            <p class="text-sm font-bold text-wine-800 flex items-center gap-2"><ion-icon name="swap-horizontal-outline"></ion-icon>{{ 'demo.crossRole' | t }}</p>
            <p class="text-xs text-cocoa-600 mt-1.5 leading-relaxed">{{ (isOwner() ? 'demo.crossRoleOwner' : 'demo.crossRoleDiner') | t }}</p>
          </div>

          <div class="mt-5 rounded-2xl bg-white border border-creamy-200 p-4">
            <p class="text-xs font-bold uppercase tracking-wide text-cocoa-400 mb-2">{{ 'auth.demoAccounts' | t }}</p>
            <p class="text-xs text-cocoa-600">{{ 'auth.diner' | t }} · <span class="num">diner&#64;tastytable.app</span></p>
            <p class="text-xs text-cocoa-600">{{ 'auth.owner' | t }} · <span class="num">owner&#64;casabrasa.app</span></p>
            <p class="text-[11px] text-cocoa-400 mt-1">{{ es() ? 'Contraseña' : 'Password' }}: <span class="num">Taste123!</span></p>
          </div>
        </div>
      </ng-template>
    </ion-modal>
  `,
})
export class HelpPanelComponent {
  readonly demo = inject(DemoService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  readonly realKeys = ['demo.real1', 'demo.real2', 'demo.real3', 'demo.real4'];
  isOwner(): boolean { return this.auth.role() === 'owner'; }
  es(): boolean { return this.i18n.lang() === 'es'; }
}
