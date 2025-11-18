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
  selector: "app-profile-edit",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="profile-edit-container">
      <div class="header">
        <h1>Modifier mon profil</h1>
        <a routerLink="/profile" class="btn-back">Retour</a>
      </div>

      <form
        [formGroup]="profileForm"
        (ngSubmit)="onSubmit()"
        class="profile-form"
      >
        <div class="form-section">
          <h2>Informations personnelles</h2>

          <div class="form-group">
            <label for="firstName">Prénom</label>
            <input
              type="text"
              id="firstName"
              formControlName="firstName"
              placeholder="Votre prénom"
            />
            <div
              class="error"
              *ngIf="
                profileForm.get('firstName')?.invalid &&
                profileForm.get('firstName')?.touched
              "
            >
              Le prénom est requis
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Nom</label>
            <input
              type="text"
              id="lastName"
              formControlName="lastName"
              placeholder="Votre nom"
            />
            <div
              class="error"
              *ngIf="
                profileForm.get('lastName')?.invalid &&
                profileForm.get('lastName')?.touched
              "
            >
              Le nom est requis
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="votre@email.com"
            />
            <div
              class="error"
              *ngIf="
                profileForm.get('email')?.invalid &&
                profileForm.get('email')?.touched
              "
            >
              Email invalide
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              formControlName="phone"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        </div>

        <div class="form-section">
          <h2>Adresse</h2>

          <div class="form-group">
            <label for="address">Adresse</label>
            <input
              type="text"
              id="address"
              formControlName="address"
              placeholder="123 Rue Example"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">Ville</label>
              <input
                type="text"
                id="city"
                formControlName="city"
                placeholder="Paris"
              />
            </div>

            <div class="form-group">
              <label for="postalCode">Code postal</label>
              <input
                type="text"
                id="postalCode"
                formControlName="postalCode"
                placeholder="75001"
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" (click)="onCancel()" class="btn-cancel">
            Annuler
          </button>
          <button
            type="submit"
            [disabled]="profileForm.invalid"
            class="btn-save"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .profile-edit-container {
        max-width: 800px;
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

      .profile-form {
        background: white;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .form-section {
        margin-bottom: 2rem;
      }

      .form-section h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #009688;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }

      input:focus {
        outline: none;
        border-color: #009688;
      }

      .error {
        color: #f44336;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 2rem;
        border-top: 1px solid #eee;
      }

      .btn-cancel,
      .btn-save {
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .btn-cancel {
        background-color: #e0e0e0;
        color: #333;
      }

      .btn-save {
        background-color: #009688;
        color: white;
      }

      .btn-save:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      .btn-cancel:hover {
        background-color: #d0d0d0;
      }

      .btn-save:hover:not(:disabled) {
        background-color: #00796b;
      }
    `,
  ],
})
export class ProfileEditComponent implements OnInit {
  profileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: [""],
      address: [""],
      city: [""],
      postalCode: [""],
    });

    // TODO: Load user data and populate form
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      console.log("Profile updated:", this.profileForm.value);
      // TODO: Call service to update profile
      this.router.navigate(["/profile"]);
    }
  }

  onCancel(): void {
    this.router.navigate(["/profile"]);
  }
}
