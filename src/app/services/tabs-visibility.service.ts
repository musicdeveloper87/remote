import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabsVisibilityService {
  private tabsVisibilitySubject = new BehaviorSubject<boolean>(true);
  public tabsVisibility$: Observable<boolean> = this.tabsVisibilitySubject.asObservable();
  private isVisible = true;

  constructor() {}

  toggleTabsVisibility(visible?: boolean): void {
    if (visible !== undefined) {
      this.isVisible = visible;
    } else {
      // Toggle: if no value provided, flip current state
      this.isVisible = !this.isVisible;
    }
    this.tabsVisibilitySubject.next(this.isVisible);
  }

  getVisibilityState(): boolean {
    return this.isVisible;
  }
} 