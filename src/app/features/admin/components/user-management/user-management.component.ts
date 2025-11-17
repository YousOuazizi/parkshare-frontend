import { Component, OnInit, signal, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AdminService, UserStatistics } from '../../services/admin.service';
import { User, UserRole, VerificationLevel } from '../../../../core/models/user.model';

interface FilterForm {
  search: FormControl<string | null>;
  role: FormControl<UserRole | null>;
  verificationLevel: FormControl<VerificationLevel | null>;
  isActive: FormControl<boolean | null>;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Signals
  users = signal<User[]>([]);
  statistics = signal<UserStatistics | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalUsers = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'email',
    'name',
    'role',
    'verificationLevel',
    'status',
    'createdAt',
    'lastLogin',
    'actions'
  ];

  dataSource = new MatTableDataSource<User>();
  selection = new SelectionModel<User>(true, []);

  // Filter form
  filterForm = new FormGroup<FilterForm>({
    search: new FormControl<string>(''),
    role: new FormControl<UserRole | null>(null),
    verificationLevel: new FormControl<VerificationLevel | null>(null),
    isActive: new FormControl<boolean | null>(null)
  });

  // Enum references for template
  UserRole = UserRole;
  VerificationLevel = VerificationLevel;

  // Role options
  roleOptions = [
    { value: UserRole.USER, label: 'User' },
    { value: UserRole.OWNER, label: 'Owner' },
    { value: UserRole.ADMIN, label: 'Admin' }
  ];

  // Verification level options
  verificationLevelOptions = [
    { value: VerificationLevel.LEVEL_0, label: 'Level 0' },
    { value: VerificationLevel.LEVEL_1, label: 'Level 1' },
    { value: VerificationLevel.LEVEL_2, label: 'Level 2' },
    { value: VerificationLevel.LEVEL_3, label: 'Level 3' },
    { value: VerificationLevel.LEVEL_4, label: 'Level 4' }
  ];

  // Status options
  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Suspended' }
  ];

  // Computed values
  hasSelection = computed(() => this.selection.selected.length > 0);
  selectionCount = computed(() => this.selection.selected.length);

  ngOnInit(): void {
    this.loadUsers();
    this.loadStatistics();
    this.setupFilterListeners();
  }

  /**
   * Load users from API
   */
  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = {
      page: this.currentPage() + 1,
      limit: this.pageSize(),
      search: this.filterForm.value.search || undefined,
      role: this.filterForm.value.role || undefined,
      verificationLevel: this.filterForm.value.verificationLevel || undefined,
      isActive: this.filterForm.value.isActive ?? undefined
    };

    this.adminService.getUsers(params).subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.totalUsers.set(response.total);
        this.dataSource.data = response.users;
        this.loading.set(false);
        this.selection.clear();
      },
      error: (err) => {
        this.error.set('Failed to load users. Please try again.');
        this.loading.set(false);
        console.error('Error loading users:', err);
      }
    });
  }

  /**
   * Load user statistics
   */
  loadStatistics(): void {
    this.adminService.getUserStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      }
    });
  }

  /**
   * Setup filter form listeners with debounce
   */
  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage.set(0);
        this.loadUsers();
      });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadUsers();
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      role: null,
      verificationLevel: null,
      isActive: null
    });
  }

  /**
   * Check if all rows are selected
   */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /**
   * Toggle all rows selection
   */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /**
   * Get user full name
   */
  getUserFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Get role chip color
   */
  getRoleColor(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'warn';
      case UserRole.OWNER:
        return 'accent';
      case UserRole.USER:
      default:
        return 'primary';
    }
  }

  /**
   * Get verification level color
   */
  getVerificationLevelColor(level: VerificationLevel): string {
    switch (level) {
      case VerificationLevel.LEVEL_4:
        return 'success';
      case VerificationLevel.LEVEL_3:
        return 'primary';
      case VerificationLevel.LEVEL_2:
        return 'accent';
      case VerificationLevel.LEVEL_1:
        return 'warn';
      case VerificationLevel.LEVEL_0:
      default:
        return 'default';
    }
  }

  /**
   * Get status color
   */
  getStatusColor(isActive: boolean): string {
    return isActive ? 'success' : 'warn';
  }

  /**
   * Get status text
   */
  getStatusText(user: User): string {
    // Assuming we have an isActive field, otherwise use a different indicator
    return 'Active'; // Modify based on your User model
  }

  /**
   * Format date
   */
  formatDate(date: string | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * View user details
   */
  viewUser(user: User): void {
    // Implement view user dialog
    console.log('View user:', user);
  }

  /**
   * Edit user
   */
  editUser(user: User): void {
    // Implement edit user dialog
    console.log('Edit user:', user);
  }

  /**
   * Suspend user
   */
  suspendUser(user: User): void {
    if (!confirm(`Are you sure you want to suspend ${this.getUserFullName(user)}?`)) {
      return;
    }

    this.adminService.suspendUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error suspending user:', err);
        alert('Failed to suspend user. Please try again.');
      }
    });
  }

  /**
   * Delete user
   */
  deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete ${this.getUserFullName(user)}? This action cannot be undone.`)) {
      return;
    }

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.loadStatistics();
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Please try again.');
      }
    });
  }

  /**
   * Bulk suspend selected users
   */
  bulkSuspend(): void {
    const selectedIds = this.selection.selected.map(u => u.id);
    if (!confirm(`Are you sure you want to suspend ${selectedIds.length} users?`)) {
      return;
    }

    this.adminService.bulkSuspendUsers(selectedIds).subscribe({
      next: (response) => {
        alert(`Successfully suspended ${response.count} users.`);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error bulk suspending users:', err);
        alert('Failed to suspend users. Please try again.');
      }
    });
  }

  /**
   * Bulk delete selected users
   */
  bulkDelete(): void {
    const selectedIds = this.selection.selected.map(u => u.id);
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} users? This action cannot be undone.`)) {
      return;
    }

    this.adminService.bulkDeleteUsers(selectedIds).subscribe({
      next: (response) => {
        alert(`Successfully deleted ${response.count} users.`);
        this.loadUsers();
        this.loadStatistics();
      },
      error: (err) => {
        console.error('Error bulk deleting users:', err);
        alert('Failed to delete users. Please try again.');
      }
    });
  }

  /**
   * Export users to CSV
   */
  exportUsers(): void {
    // Implement CSV export functionality
    console.log('Export users to CSV');
  }

  /**
   * Track by function for table optimization
   */
  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}
