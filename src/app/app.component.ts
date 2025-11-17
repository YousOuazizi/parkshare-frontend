import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { WebSocketService } from './core/services/websocket.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);

  ngOnInit() {
    // Connect to WebSocket if authenticated
    if (this.authService.isAuthenticated()) {
      this.wsService.connect();
    }
  }
}
