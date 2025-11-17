import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatChipModule } from '@angular/material/chip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionPlan, SubscriptionType } from '../../../../core/models';

interface PlanTier {
  plan?: SubscriptionPlan;
  name: string;
  type: SubscriptionType;
  description: string;
  price: number;
  currency: string;
  popular?: boolean;
  features: string[];
  limits: {
    bookingsPerMonth?: number;
    spotsListed?: number;
    shares?: number;
  };
}

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTableModule,
    MatChipModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})
export class SubscriptionPlansComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);

  // Signals for reactive state
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  isAnnual = signal<boolean>(false);
  plans = signal<SubscriptionPlan[]>([]);

  // Predefined plan tiers
  planTiers = signal<PlanTier[]>([
    {
      name: 'Free',
      type: SubscriptionType.MONTHLY,
      description: 'Perfect for occasional parkers',
      price: 0,
      currency: 'USD',
      features: [
        'Up to 2 bookings per month',
        'Basic search functionality',
        'Email notifications',
        'Standard customer support',
        'Mobile app access'
      ],
      limits: {
        bookingsPerMonth: 2,
        spotsListed: 0,
        shares: 0
      }
    },
    {
      name: 'Basic',
      type: SubscriptionType.MONTHLY,
      description: 'Ideal for regular users',
      price: 9.99,
      currency: 'USD',
      features: [
        'Up to 10 bookings per month',
        'List up to 2 parking spots',
        'Priority search results',
        'Advanced filters',
        'Email & SMS notifications',
        '1 subscription share',
        'Priority customer support'
      ],
      limits: {
        bookingsPerMonth: 10,
        spotsListed: 2,
        shares: 1
      }
    },
    {
      name: 'Premium',
      type: SubscriptionType.MONTHLY,
      description: 'Best for power users',
      price: 24.99,
      currency: 'USD',
      popular: true,
      features: [
        'Unlimited bookings',
        'List up to 10 parking spots',
        'Featured listings',
        'Advanced analytics',
        'Instant booking confirmation',
        '5 subscription shares',
        'Flexible cancellation',
        '24/7 priority support',
        'Exclusive discounts'
      ],
      limits: {
        spotsListed: 10,
        shares: 5
      }
    },
    {
      name: 'Enterprise',
      type: SubscriptionType.MONTHLY,
      description: 'For businesses and fleets',
      price: 99.99,
      currency: 'USD',
      features: [
        'Unlimited bookings',
        'Unlimited spot listings',
        'Custom branding',
        'API access',
        'Advanced reporting & analytics',
        'Unlimited subscription shares',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom integrations',
        'White-label options'
      ],
      limits: {
        shares: -1 // Unlimited
      }
    }
  ]);

  // Computed signal for price calculation based on billing cycle
  displayedPlans = computed(() => {
    const annual = this.isAnnual();
    return this.planTiers().map(tier => ({
      ...tier,
      displayPrice: annual ? tier.price * 10 : tier.price, // 20% discount for annual
      savingsPercent: annual ? 17 : 0,
      billingPeriod: annual ? 'year' : 'month'
    }));
  });

  // Feature comparison data
  comparisonFeatures = [
    { name: 'Bookings per month', free: '2', basic: '10', premium: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Parking spots listed', free: '0', basic: '2', premium: '10', enterprise: 'Unlimited' },
    { name: 'Subscription shares', free: '0', basic: '1', premium: '5', enterprise: 'Unlimited' },
    { name: 'Search filters', free: 'Basic', basic: 'Advanced', premium: 'Advanced', enterprise: 'Advanced' },
    { name: 'Notifications', free: 'Email', basic: 'Email & SMS', premium: 'Email & SMS', enterprise: 'Email & SMS' },
    { name: 'Analytics', free: 'None', basic: 'Basic', premium: 'Advanced', enterprise: 'Custom' },
    { name: 'Customer support', free: 'Standard', basic: 'Priority', premium: '24/7 Priority', enterprise: 'Dedicated' },
    { name: 'Featured listings', free: 'No', basic: 'No', premium: 'Yes', enterprise: 'Yes' },
    { name: 'API access', free: 'No', basic: 'No', premium: 'No', enterprise: 'Yes' },
    { name: 'Custom branding', free: 'No', basic: 'No', premium: 'No', enterprise: 'Yes' }
  ];

  displayedColumns: string[] = ['feature', 'free', 'basic', 'premium', 'enterprise'];

  ngOnInit(): void {
    this.loadPlans();
  }

  /**
   * Load subscription plans from API
   */
  loadPlans(): void {
    this.loading.set(true);
    this.error.set(null);

    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        // Merge API plans with predefined tiers if needed
        this.mergePlansWithTiers(plans);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load subscription plans. Please try again.');
        this.loading.set(false);
        console.error('Error loading plans:', err);
      }
    });
  }

  /**
   * Merge API plans with predefined tiers
   */
  private mergePlansWithTiers(apiPlans: SubscriptionPlan[]): void {
    const currentTiers = this.planTiers();
    const updatedTiers = currentTiers.map(tier => {
      const matchingPlan = apiPlans.find(p =>
        p.name.toLowerCase() === tier.name.toLowerCase() &&
        p.type === tier.type
      );

      if (matchingPlan) {
        return {
          ...tier,
          plan: matchingPlan,
          price: matchingPlan.price,
          currency: matchingPlan.currency,
          features: matchingPlan.features.length > 0 ? matchingPlan.features : tier.features
        };
      }

      return tier;
    });

    this.planTiers.set(updatedTiers);
  }

  /**
   * Toggle billing cycle between monthly and annual
   */
  toggleBillingCycle(checked: boolean): void {
    this.isAnnual.set(checked);
  }

  /**
   * Handle plan selection
   */
  selectPlan(planTier: PlanTier): void {
    if (planTier.plan?.id) {
      // Navigate to checkout or subscription creation page
      this.router.navigate(['/subscriptions/checkout'], {
        queryParams: {
          planId: planTier.plan.id,
          billing: this.isAnnual() ? 'annual' : 'monthly'
        }
      });
    } else {
      // Handle predefined plan without API data
      console.warn('Plan not available:', planTier.name);
    }
  }

  /**
   * Format price with currency
   */
  formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }

  /**
   * Get CTA button text based on plan
   */
  getCtaText(planName: string): string {
    if (planName === 'Free') {
      return 'Get Started';
    } else if (planName === 'Enterprise') {
      return 'Contact Sales';
    } else {
      return 'Subscribe Now';
    }
  }

  /**
   * Get CTA button color
   */
  getCtaColor(planName: string): 'primary' | 'accent' | 'warn' {
    return planName === 'Premium' ? 'accent' : 'primary';
  }

  /**
   * Check if value indicates unlimited
   */
  isUnlimited(value: string): boolean {
    return value.toLowerCase() === 'unlimited';
  }

  /**
   * Get icon for feature availability
   */
  getFeatureIcon(value: string): string {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'no' || lowerValue === 'none' || value === '0') {
      return 'close';
    } else if (lowerValue === 'yes' || this.isUnlimited(value)) {
      return 'check';
    }
    return 'info';
  }

  /**
   * Get CSS class for feature cell
   */
  getFeatureClass(value: string): string {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'no' || lowerValue === 'none' || value === '0') {
      return 'feature-unavailable';
    } else if (lowerValue === 'yes' || this.isUnlimited(value)) {
      return 'feature-available';
    }
    return 'feature-limited';
  }
}
