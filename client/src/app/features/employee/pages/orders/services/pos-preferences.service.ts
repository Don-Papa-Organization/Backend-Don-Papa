import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PosPreferencesService {
  private readonly AUTO_PRINT_KEY = 'employee_pos_auto_print';
  private readonly autoPrintSubject = new BehaviorSubject<boolean>(this.loadAutoPrint());
  private readonly reloadSubject = new Subject<void>();

  readonly autoPrint$ = this.autoPrintSubject.asObservable();
  readonly reload$ = this.reloadSubject.asObservable();

  triggerReload(): void {
    this.reloadSubject.next();
  }

  get autoPrintValue(): boolean {
    return this.autoPrintSubject.value;
  }

  setAutoPrint(value: boolean): void {
    this.autoPrintSubject.next(value);
    localStorage.setItem(this.AUTO_PRINT_KEY, value ? '1' : '0');
  }

  private loadAutoPrint(): boolean {
    const raw = localStorage.getItem(this.AUTO_PRINT_KEY);
    if (raw === null) return true;
    return raw === '1';
  }
}
