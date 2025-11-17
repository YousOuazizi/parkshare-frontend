import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule],
  template: `
    <div class="error-container">
      <mat-card class="error-card">
        <mat-card-header>
          <mat-card-title>
            <h1>404 - Page Non Trouvée</h1>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Désolé, la page que vous recherchez n'existe pas.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/">
            Retour à l'accueil
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: var(--spacing-md);
    }
    .error-card {
      max-width: 500px;
      text-align: center;
    }
    mat-card-actions {
      display: flex;
      justify-content: center;
    }
  `]
})
export class NotFoundComponent {}
