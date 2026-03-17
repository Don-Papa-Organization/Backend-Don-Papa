import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableSaleHeaderService {
  private readonly mesaTitleSubject = new BehaviorSubject<string>('');
  private readonly paraLlevarSubject = new BehaviorSubject<boolean>(false);
  private readonly reloadSubject = new Subject<void>();

  readonly mesaTitle$ = this.mesaTitleSubject.asObservable();
  readonly paraLlevar$ = this.paraLlevarSubject.asObservable();
  readonly reload$ = this.reloadSubject.asObservable();

  get mesaTitleValue(): string {
    return this.mesaTitleSubject.value;
  }

  get paraLlevarValue(): boolean {
    return this.paraLlevarSubject.value;
  }

  setMesaTitle(title: string): void {
    this.mesaTitleSubject.next((title || '').trim());
  }

  setParaLlevar(isChecked: boolean): void {
    this.paraLlevarSubject.next(!!isChecked);
  }

  requestReload(): void {
    this.reloadSubject.next();
  }

  clear(): void {
    this.mesaTitleSubject.next('');
    this.paraLlevarSubject.next(false);
  }
}