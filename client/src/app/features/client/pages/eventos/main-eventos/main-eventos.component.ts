import { Component } from '@angular/core';
import { EventsListPage } from '../components/events-list/events-list.page';

@Component({
  selector: 'app-main-eventos',
  standalone: true,
  imports: [EventsListPage],
  templateUrl: './main-eventos.component.html',
  styleUrl: './main-eventos.component.scss'
})
export class MainEventosComponent {}
