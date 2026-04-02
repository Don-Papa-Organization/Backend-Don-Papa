import { Component } from '@angular/core';

@Component({
  selector: 'app-guess-layout',
  standalone: false,
  templateUrl: './guess-layout.html',
  styleUrl: './guess-layout.scss'
})
export class GuessLayout {
  irALogin(): void {
    window.location.assign('/auth/login');
  }

  irARegistro(): void {
    window.location.assign('/auth/register');
  }
}

