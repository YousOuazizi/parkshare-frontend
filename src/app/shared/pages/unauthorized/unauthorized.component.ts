import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule],
  template: `
    <div class="error-container">
      <mat-card class="error-card">
        <mat-card-header>
          <mat-card-title>
            <h1>403 - Accès Non Autorisé</h1>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Vous n'avez pas la permission d'accéder à cette page.</p>
          <p>Vérifiez votre niveau de vérification ou vos droits d'accès.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/">
            Retour à l'accueil
          </button>
          <button mat-raised-button routerLink="/verification">
            Vérifier mon compte
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
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }
  `]
})
export class UnauthorizedComponent {}
