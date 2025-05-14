import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TabsVisibilityService } from '../services/tabs-visibility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, OnDestroy {
  showTabs = true;
  private tabsVisibilitySubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private tabsVisibilityService: TabsVisibilityService
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Ocultar tabs en tab3
        this.showTabs = !event.url.includes('/tabs/tab3');
      }
    });

    // Suscripción al servicio de visibilidad
    this.tabsVisibilitySubscription = this.tabsVisibilityService.tabsVisibility$.subscribe(
      visible => {
        // Solo actualizar si no estamos en tab3 (que siempre oculta tabs)
        if (!this.router.url.includes('/tabs/tab3')) {
          this.showTabs = visible;
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.tabsVisibilitySubscription) {
      this.tabsVisibilitySubscription.unsubscribe();
    }
  }

  async logout() {
    try {
      await this.authService.logOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
