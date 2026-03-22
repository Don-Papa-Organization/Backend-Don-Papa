import { Component, Input } from '@angular/core';

type HeaderMode = 'client' | 'employee' | 'admin';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  @Input() mode: HeaderMode = 'client';
  @Input() icono: boolean = false;
  @Input() titulo: string = "Don Papa Licores";
  @Input() opacidad: number = 1
}
