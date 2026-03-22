import { Component } from '@angular/core';
import { ProfileClientPage } from '../components/profile-client/profile-client.page';

@Component({
  selector: 'app-main-perfil',
  standalone: true,
  imports: [ProfileClientPage],
  templateUrl: './main-perfil.component.html',
  styleUrl: './main-perfil.component.scss'
})
export class MainPerfilComponent {}
