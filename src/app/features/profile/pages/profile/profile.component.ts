import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>Mon Profil</h1>
        <div class="profile-actions">
          <a routerLink="/profile/edit" class="btn-edit">Modifier</a>
          <a routerLink="/profile/settings" class="btn-settings">Paramètres</a>
        </div>
      </div>

      <div class="profile-content">
        <div class="profile-info">
          <div class="profile-avatar">
            <div class="avatar-placeholder">
              {{ userInitials }}
            </div>
          </div>

          <div class="profile-details">
            <h2>{{ userName }}</h2>
            <p class="email">{{ userEmail }}</p>
            <p class="member-since">Membre depuis {{ memberSince }}</p>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">0</span>
            <span class="stat-label">Parkings</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">0</span>
            <span class="stat-label">Réservations</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">0</span>
            <span class="stat-label">Avis</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .profile-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .profile-actions {
        display: flex;
        gap: 1rem;
      }

      .btn-edit,
      .btn-settings {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        transition: background-color 0.3s;
      }

      .btn-edit {
        background-color: #009688;
        color: white;
      }

      .btn-settings {
        background-color: #ff6f00;
        color: white;
      }

      .profile-content {
        background: white;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .profile-info {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
      }

      .avatar-placeholder {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background-color: #009688;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
      }

      .profile-details h2 {
        margin: 0 0 0.5rem 0;
      }

      .email {
        color: #666;
        margin: 0.25rem 0;
      }

      .member-since {
        color: #999;
        font-size: 0.9rem;
      }

      .profile-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #eee;
      }

      .stat-item {
        text-align: center;
      }

      .stat-value {
        display: block;
        font-size: 2rem;
        font-weight: bold;
        color: #009688;
      }

      .stat-label {
        display: block;
        color: #666;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  userName = "Utilisateur";
  userEmail = "user@parkshare.com";
  userInitials = "U";
  memberSince = "janvier 2024";

  ngOnInit(): void {
    // TODO: Load user data from service
  }
}
