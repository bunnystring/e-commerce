import { PermissionsService } from '@e-commerce/shared-permissions';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  standalone: true,
  imports: [RouterModule, HeaderComponent, SidebarComponent, FooterComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'E-Commerce Store';

  private permissionsService = inject(PermissionsService);

  currentPermissions$ = this.permissionsService.permissions$;

  constructor() {
    this.permissionsService.setPermissions(['orders:read']);
  }

}
