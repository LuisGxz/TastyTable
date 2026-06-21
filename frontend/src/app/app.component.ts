import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, arrowBackOutline, calendarOutline, calendarNumberOutline, checkmarkCircle,
  chevronDownOutline, chevronForwardOutline, closeOutline, compassOutline, createOutline,
  informationCircleOutline, languageOutline, playOutline, sparklesOutline, swapHorizontalOutline,
  locationOutline, logOutOutline, peopleOutline, personCircleOutline, removeOutline, restaurantOutline,
  search, star, storefrontOutline, timeOutline, trashOutline, ticketOutline, heartOutline, heart,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet />
    </ion-app>
  `,
})
export class AppComponent {
  constructor() {
    addIcons({
      addOutline, arrowBackOutline, calendarOutline, calendarNumberOutline, checkmarkCircle,
      chevronDownOutline, chevronForwardOutline, closeOutline, compassOutline, createOutline,
      informationCircleOutline, languageOutline, playOutline, sparklesOutline, swapHorizontalOutline,
      locationOutline, logOutOutline, peopleOutline, personCircleOutline, removeOutline, restaurantOutline,
      search, star, storefrontOutline, timeOutline, trashOutline, ticketOutline, heartOutline, heart,
    });
  }
}
