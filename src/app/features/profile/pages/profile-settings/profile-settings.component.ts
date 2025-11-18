import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-profile-settings",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="settings-container">
      <div class="header">
        <h1>Paramètres</h1>
        <a routerLink="/profile" class="btn-back">Retour</a>
      </div>

      <div class="settings-content">
        <!-- Notifications Settings -->
        <div class="settings-section">
          <h2>Notifications</h2>
          <form [formGroup]="notificationsForm">
            <div class="setting-item">
              <label>
                <input type="checkbox" formControlName="emailNotifications" />
                Recevoir les notifications par email
              </label>
            </div>
            <div class="setting-item">
              <label>
                <input type="checkbox" formControlName="smsNotifications" />
                Recevoir les notifications par SMS
              </label>
            </div>
            <div class="setting-item">
              <label>
                <input type="checkbox" formControlName="pushNotifications" />
                Notifications push
              </label>
            </div>
            <div class="setting-item">
              <label>
                <input type="checkbox" formControlName="marketingEmails" />
                Recevoir les emails marketing
              </label>
            </div>
          </form>
        </div>

        <!-- Privacy Settings -->
        <div class="settings-section">
          <h2>Confidentialité</h2>
          <form [formGroup]="privacyForm">
            <div class="setting-item">
              <label>
                <input type="checkbox" formControlName="showProfile" />
                Profil public
              </label>
              <p class="setting-description">
                Votre profil sera visible par les autres utilisateurs
              </p>
            </div>
            <div class="setting-item">
              <label>
                <input type="checkbox" formControlName="showPhone" />
                Afficher mon numéro de téléphone
              </label>
            </div>
            <div class="setting-item">
              <label>
                <input type="checkbox" formControlName="showEmail" />
                Afficher mon email
              </label>
            </div>
          </form>
        </div>

        <!-- Password Change -->
        <div class="settings-section">
          <h2>Changer le mot de passe</h2>
          <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
            <div class="form-group">
              <label for="currentPassword">Mot de passe actuel</label>
              <input
                type="password"
                id="currentPassword"
                formControlName="currentPassword"
                placeholder="••••••••"
              />
            </div>
            <div class="form-group">
              <label for="newPassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                formControlName="newPassword"
                placeholder="••••••••"
              />
              <div
                class="error"
                *ngIf="
                  passwordForm.get('newPassword')?.invalid &&
                  passwordForm.get('newPassword')?.touched
                "
              >
                Le mot de passe doit contenir au moins 8 caractères
              </div>
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="••••••••"
              />
              <div
                class="error"
                *ngIf="
                  passwordForm.hasError('passwordMismatch') &&
                  passwordForm.get('confirmPassword')?.touched
                "
              >
                Les mots de passe ne correspondent pas
              </div>
            </div>
            <button
              type="submit"
              [disabled]="passwordForm.invalid"
              class="btn-primary"
            >
              Changer le mot de passe
            </button>
          </form>
        </div>

        <!-- Danger Zone -->
        <div class="settings-section danger-zone">
          <h2>Zone dangereuse</h2>
          <div class="setting-item">
            <button
              type="button"
              (click)="onDeactivateAccount()"
              class="btn-danger"
            >
              Désactiver mon compte
            </button>
            <p class="setting-description">
              Votre compte sera désactivé temporairement
            </p>
          </div>
          <div class="setting-item">
            <button
              type="button"
              (click)="onDeleteAccount()"
              class="btn-danger"
            >
              Supprimer mon compte
            </button>
            <p class="setting-description">Cette action est irréversible</p>
          </div>
        </div>

        <!-- Save Button -->
        <div class="form-actions">
          <button type="button" (click)="onSaveSettings()" class="btn-save">
            Enregistrer les paramètres
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .btn-back {
        padding: 0.5rem 1rem;
        background-color: #666;
        color: white;
        text-decoration: none;
        border-radius: 4px;
      }

      .settings-content {
        background: white;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .settings-section {
        margin-bottom: 2.5rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #eee;
      }

      .settings-section:last-of-type {
        border-bottom: none;
      }

      .settings-section h2 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: #009688;
      }

      .setting-item {
        margin-bottom: 1rem;
      }

      .setting-item label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-weight: 500;
      }

      .setting-item input[type="checkbox"] {
        margin-right: 0.75rem;
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .setting-description {
        margin: 0.5rem 0 0 2rem;
        color: #666;
        font-size: 0.875rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
      }

      .form-group input {
        width: 100%;
        max-width: 400px;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }

      .form-group input:focus {
        outline: none;
        border-color: #009688;
      }

      .error {
        color: #f44336;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .btn-primary,
      .btn-danger,
      .btn-save {
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .btn-primary {
        background-color: #009688;
        color: white;
      }

      .btn-primary:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #00796b;
      }

      .btn-danger {
        background-color: #f44336;
        color: white;
      }

      .btn-danger:hover {
        background-color: #d32f2f;
      }

      .btn-save {
        background-color: #009688;
        color: white;
        width: 100%;
        margin-top: 1rem;
      }

      .btn-save:hover {
        background-color: #00796b;
      }

      .danger-zone {
        background-color: #fff3f3;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #ffcdd2;
      }

      .danger-zone h2 {
        color: #f44336;
      }

      .form-actions {
        padding-top: 1rem;
      }
    `,
  ],
})
export class ProfileSettingsComponent implements OnInit {
  notificationsForm!: FormGroup;
  privacyForm!: FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      marketingEmails: [false],
    });

    this.privacyForm = this.fb.group({
      showProfile: [true],
      showPhone: [false],
      showEmail: [false],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", Validators.required],
        newPassword: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );

    // TODO: Load user settings from service
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get("newPassword")?.value === g.get("confirmPassword")?.value
      ? null
      : { passwordMismatch: true };
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      console.log("Password changed");
      // TODO: Call service to change password
      this.passwordForm.reset();
    }
  }

  onSaveSettings(): void {
    const settings = {
      notifications: this.notificationsForm.value,
      privacy: this.privacyForm.value,
    };
    console.log("Settings saved:", settings);
    // TODO: Call service to save settings
  }

  onDeactivateAccount(): void {
    if (confirm("Êtes-vous sûr de vouloir désactiver votre compte ?")) {
      console.log("Account deactivated");
      // TODO: Call service to deactivate account
    }
  }

  onDeleteAccount(): void {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      )
    ) {
      console.log("Account deleted");
      // TODO: Call service to delete account
      this.router.navigate(["/"]);
    }
  }
}
