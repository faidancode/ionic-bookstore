import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import {
  IonApp,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonRouterOutlet,
    IonApp,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
  ],
})
export class AppComponent {
  readonly showTabs = signal(true);

  constructor(private router: Router) {
    this.updateTabsVisibility(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nav = event as NavigationEnd;
        this.updateTabsVisibility(nav.urlAfterRedirects);
      });
  }

  private updateTabsVisibility(url: string) {
    this.showTabs.set(!url.startsWith('/login'));
  }
}
