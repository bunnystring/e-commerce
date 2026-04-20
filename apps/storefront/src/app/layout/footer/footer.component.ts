import { Component } from '@angular/core';

@Component({
  selector: 'app-component-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone: true,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
