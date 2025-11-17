import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../features/notification/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <div class="toolbar-content">
        <a routerLink="/" class="logo">
          🅿️ ParkShare
        </a>

        <nav class="nav-links">
          <a mat-button routerLink="/parkings" routerLinkActive="active">
            Parkings
          </a>

          @if (authService.isAuthenticated()) {
            <a mat-button routerLink="/bookings" routerLinkActive="active">
              Réservations
            </a>

            @if (authService.canPublishParking()) {
              <a mat-button routerLink="/parkings/my-parkings" routerLinkActive="active">
                Mes Parkings
              </a>
              <a mat-button routerLink="/analytics/owner" routerLinkActive="active">
                Analytics
              </a>
            }

            @if (authService.isAdmin()) {
              <a mat-button routerLink="/admin" routerLinkActive="active">
                Admin
              </a>
            }
          }
        </nav>

        <div class="user-menu">
          @if (!authService.isAuthenticated()) {
            <a mat-button routerLink="/auth/login">Connexion</a>
            <a mat-raised-button color="accent" routerLink="/auth/register">
              S'inscrire
            </a>
          } @else {
            <button mat-icon-button routerLink="/notifications">
              <mat-icon [matBadge]="notificationService.unreadCount()" matBadgeColor="warn">
                notifications
              </mat-icon>
            </button>

            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profil</span>
              </button>
              <button mat-menu-item routerLink="/verification">
                <mat-icon>verified_user</mat-icon>
                <span>Vérification ({{ authService.verificationLevel() }})</span>
              </button>
              <button mat-menu-item routerLink="/gdpr/consent">
                <mat-icon>privacy_tip</mat-icon>
                <span>Confidentialité</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>exit_to_app</mat-icon>
                <span>Déconnexion</span>
              </button>
            </mat-menu>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .toolbar-content {
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      text-decoration: none;
      color: white;
    }

    .nav-links {
      display: flex;
      gap: var(--spacing-sm);
      flex: 1;
    }

    .user-menu {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;
    }

    a.active {
      background: rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 768px) {
      .nav-links a span {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.notificationService.refreshUnreadCount();
    }
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
