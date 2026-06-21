import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { DemoService } from '../../core/demo/demo.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';
import { HelpPanelComponent } from '../demo/help-panel.component';
import { TourComponent } from '../demo/tour.component';

@Component({
  selector: 'tt-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, TPipe, TourComponent, HelpPanelComponent],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="border-t border-creamy-200">
        @if (isOwner()) {
          <ion-tab-button tab="restaurant">
            <ion-icon name="storefront-outline"></ion-icon>
            <ion-label>{{ 'tabs.restaurant' | t }}</ion-label>
          </ion-tab-button>
        } @else {
          <ion-tab-button tab="discover">
            <ion-icon name="search"></ion-icon>
            <ion-label>{{ 'tabs.discover' | t }}</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="reservations">
            <ion-icon name="calendar-outline"></ion-icon>
            <ion-label>{{ 'tabs.reservations' | t }}</ion-label>
          </ion-tab-button>
        }
        <ion-tab-button tab="account">
          <ion-icon name="person-circle-outline"></ion-icon>
          <ion-label>{{ 'tabs.account' | t }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>

    <tt-help-panel />
    <tt-tour />
  `,
})
export class TabsPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly demo = inject(DemoService);
  readonly i18n = inject(I18nService);

  ngOnInit(): void { this.demo.maybeAutoStart(); }
  isOwner(): boolean { return this.auth.role() === 'owner'; }
}
