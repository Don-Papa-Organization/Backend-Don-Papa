import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, map, Observable, startWith, distinctUntilChanged, filter } from 'rxjs';
import { selectAuthLoading } from './domain/auth/state/auth.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  isAppReady$!: Observable<boolean>;

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    const currentUrl$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url || '/')
    );

    this.isAppReady$ = combineLatest([
      currentUrl$,
      this.store.select(selectAuthLoading)
    ]).pipe(
      map(([url, authLoading]) => {
        const requiresAuthResolution =
          url.startsWith('/admin') ||
          url.startsWith('/client') ||
          url.startsWith('/employee');

        return !requiresAuthResolution || !authLoading;
      }),
      distinctUntilChanged()
    );
  }
}

