import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  reason: string;
  additionalComments: string;
}

@Component({
  selector: 'app-gdpr-delete-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Confirm Account Deletion</h2>
      </div>
      <mat-dialog-content>
        <div class="warning-message">
          <p class="primary-warning">
            <strong>This action is irreversible!</strong>
          </p>
          <p>
            You are about to permanently delete your ParkShare account and all associated data.
            This action cannot be undone.
          </p>
          <div class="consequences-list">
            <h3>What will happen:</h3>
            <ul>
              <li><mat-icon>delete_forever</mat-icon> All your personal data will be permanently deleted</li>
              <li><mat-icon>event_busy</mat-icon> You will lose access to all bookings and parking spots</li>
              <li><mat-icon>block</mat-icon> Your account will be deactivated immediately</li>
              <li><mat-icon>no_accounts</mat-icon> You will not be able to recover this account</li>
            </ul>
          </div>
          <div class="confirm-message">
            <p>Are you absolutely sure you want to proceed with this deletion request?</p>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="onCancel()">
          <mat-icon>arrow_back</mat-icon>
          Cancel
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          <mat-icon>delete_forever</mat-icon>
          Yes, Delete My Account
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      .dialog-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: var(--spacing-lg);

        .warning-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: var(--warn-color);
          margin-bottom: var(--spacing-md);
        }

        h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--warn-color);
        }
      }

      mat-dialog-content {
        padding: var(--spacing-lg) 0;

        .warning-message {
          .primary-warning {
            padding: var(--spacing-md);
            background-color: rgba(var(--warn-rgb), 0.1);
            border-left: 4px solid var(--warn-color);
            border-radius: var(--border-radius-sm);
            margin: 0 0 var(--spacing-lg) 0;
            color: var(--warn-color);
            font-size: 16px;

            strong {
              font-weight: 700;
            }
          }

          p {
            margin: 0 0 var(--spacing-lg) 0;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.7);
            line-height: 1.6;
          }

          .consequences-list {
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-lg);
            background-color: rgba(0, 0, 0, 0.02);
            border-radius: var(--border-radius-md);

            h3 {
              margin: 0 0 var(--spacing-md) 0;
              font-size: 16px;
              font-weight: 600;
              color: rgba(0, 0, 0, 0.87);
            }

            ul {
              margin: 0;
              padding: 0;
              list-style: none;

              li {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                margin-bottom: var(--spacing-md);
                font-size: 14px;
                color: rgba(0, 0, 0, 0.7);

                &:last-child {
                  margin-bottom: 0;
                }

                mat-icon {
                  font-size: 20px;
                  width: 20px;
                  height: 20px;
                  color: var(--warn-color);
                  flex-shrink: 0;
                }
              }
            }
          }

          .confirm-message {
            padding: var(--spacing-md);
            background-color: rgba(255, 193, 7, 0.1);
            border-left: 3px solid #ffc107;
            border-radius: var(--border-radius-sm);

            p {
              margin: 0;
              font-size: 15px;
              font-weight: 600;
              color: rgba(0, 0, 0, 0.87);
            }
          }
        }
      }

      mat-dialog-actions {
        padding: var(--spacing-lg) 0 0 0;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        display: flex;
        gap: var(--spacing-sm);

        button {
          mat-icon {
            margin-right: var(--spacing-xs);
          }
        }
      }
    }

    // Dark Theme Support
    .dark-theme {
      .confirm-dialog {
        mat-dialog-content {
          .warning-message {
            .primary-warning {
              background-color: rgba(var(--warn-rgb), 0.15);
            }

            p {
              color: rgba(255, 255, 255, 0.7);
            }

            .consequences-list {
              background-color: rgba(255, 255, 255, 0.02);

              h3 {
                color: rgba(255, 255, 255, 0.87);
              }

              ul li {
                color: rgba(255, 255, 255, 0.7);
              }
            }

            .confirm-message {
              background-color: rgba(255, 193, 7, 0.15);

              p {
                color: rgba(255, 255, 255, 0.87);
              }
            }
          }
        }

        mat-dialog-actions {
          border-top-color: rgba(255, 255, 255, 0.12);
        }
      }
    }
  `]
})
export class GdprDeleteConfirmDialogComponent {
  dialogRef = inject(MatDialogRef<GdprDeleteConfirmDialogComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
