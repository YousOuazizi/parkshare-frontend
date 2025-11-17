import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { PricingService } from '../../services/pricing.service';
import { PriceSuggestion, PricingAnalysis, AlgorithmType } from '../../../../core/models/pricing.model';

interface ChartPlaceholder {
  title: string;
  data: number[];
  labels: string[];
}

@Component({
  selector: 'app-pricing-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './pricing-dashboard.component.html',
  styleUrls: ['./pricing-dashboard.component.scss']
})
export class PricingDashboardComponent implements OnInit {
  private pricingService = inject(PricingService);
  private snackBar = inject(MatSnackBar);

  // Signals for state management
  suggestions = signal<PriceSuggestion[]>([]);
  selectedSuggestion = signal<PriceSuggestion | null>(null);
  analysis = signal<PricingAnalysis | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedParkingId = signal<string>('parking-1'); // Placeholder

  // Chart placeholders (to be replaced with actual chart library)
  revenueChart = signal<ChartPlaceholder>({
    title: 'Revenue Trends',
    data: [1200, 1900, 1500, 2200, 2800, 2400, 3100],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  });

  demandChart = signal<ChartPlaceholder>({
    title: 'Demand Trends',
    data: [65, 78, 72, 85, 92, 88, 95],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  });

  occupancyChart = signal<ChartPlaceholder>({
    title: 'Occupancy Rate',
    data: [55, 68, 62, 75, 82, 78, 88],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  });

  // Table columns
  displayedColumns: string[] = ['algorithm', 'current', 'suggested', 'confidence', 'impact', 'actions'];

  // Computed values
  totalRevenue = computed(() => {
    const chart = this.revenueChart();
    return chart.data.reduce((sum, val) => sum + val, 0);
  });

  averageDemand = computed(() => {
    const chart = this.demandChart();
    const avg = chart.data.reduce((sum, val) => sum + val, 0) / chart.data.length;
    return Math.round(avg);
  });

  averageOccupancy = computed(() => {
    const chart = this.occupancyChart();
    const avg = chart.data.reduce((sum, val) => sum + val, 0) / chart.data.length;
    return Math.round(avg);
  });

  bestSuggestion = computed(() => {
    const allSuggestions = this.suggestions();
    if (allSuggestions.length === 0) return null;
    return allSuggestions.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  });

  ngOnInit(): void {
    this.loadPricingSuggestions();
    this.loadPricingAnalysis();
  }

  loadPricingSuggestions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pricingService.getSuggestions().subscribe({
      next: (suggestions) => {
        this.suggestions.set(suggestions);
        if (suggestions.length > 0) {
          this.selectedSuggestion.set(suggestions[0]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load pricing suggestions');
        this.loading.set(false);
        this.showSnackBar('Failed to load pricing suggestions', 'error');
      }
    });
  }

  loadPricingAnalysis(): void {
    const parkingId = this.selectedParkingId();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    this.pricingService.getPricingAnalysis(
      parkingId,
      startDate.toISOString(),
      endDate.toISOString()
    ).subscribe({
      next: (analysis) => {
        this.analysis.set(analysis);
      },
      error: (err) => {
        console.error('Failed to load pricing analysis', err);
      }
    });
  }

  applySuggestion(suggestion: PriceSuggestion): void {
    if (suggestion.isApplied) {
      this.showSnackBar('This suggestion has already been applied', 'info');
      return;
    }

    const confirmed = confirm(
      `Apply ML-based pricing suggestion?\n\n` +
      `Current Price: $${suggestion.currentPrice}\n` +
      `Suggested Price: $${suggestion.suggestedPrice}\n` +
      `Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`
    );

    if (confirmed) {
      this.pricingService.applySuggestion(suggestion.id).subscribe({
        next: () => {
          this.showSnackBar('Pricing suggestion applied successfully', 'success');
          this.loadPricingSuggestions();
        },
        error: () => {
          this.showSnackBar('Failed to apply pricing suggestion', 'error');
        }
      });
    }
  }

  optimizePricing(): void {
    const parkingId = this.selectedParkingId();

    this.showSnackBar('Generating optimal pricing...', 'info', 2000);

    this.pricingService.suggestPrice(parkingId).subscribe({
      next: (suggestion) => {
        this.showSnackBar('Pricing optimization complete', 'success');
        this.loadPricingSuggestions();
      },
      error: () => {
        this.showSnackBar('Failed to optimize pricing', 'error');
      }
    });
  }

  getAlgorithmIcon(type: AlgorithmType): string {
    const icons: Record<AlgorithmType, string> = {
      [AlgorithmType.BASE]: 'calculate',
      [AlgorithmType.ML]: 'psychology',
      [AlgorithmType.EVENT]: 'event'
    };
    return icons[type] || 'info';
  }

  getAlgorithmColor(type: AlgorithmType): string {
    const colors: Record<AlgorithmType, string> = {
      [AlgorithmType.BASE]: 'primary',
      [AlgorithmType.ML]: 'accent',
      [AlgorithmType.EVENT]: 'warn'
    };
    return colors[type] || 'primary';
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'accent';
    if (confidence >= 0.6) return 'primary';
    return 'warn';
  }

  calculatePriceChange(suggestion: PriceSuggestion): number {
    return ((suggestion.suggestedPrice - suggestion.currentPrice) / suggestion.currentPrice) * 100;
  }

  formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private showSnackBar(
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration: number = 3000
  ): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }
}
