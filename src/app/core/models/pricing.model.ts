export enum PriceRuleType {
  TIME_BASED = 'TIME_BASED',
  DAY_BASED = 'DAY_BASED',
  DATE_BASED = 'DATE_BASED',
  DURATION_BASED = 'DURATION_BASED',
  DISCOUNT = 'DISCOUNT'
}

export enum AlgorithmType {
  BASE = 'BASE',
  ML = 'ML',
  EVENT = 'EVENT'
}

export interface TimeCondition {
  startTime: string;
  endTime: string;
}

export interface DayCondition {
  daysOfWeek: number[];
}

export interface DateCondition {
  startDate: string;
  endDate: string;
}

export interface DurationCondition {
  minHours: number;
  maxHours?: number;
}

export interface PriceRule {
  id: string;
  parkingId: string;
  name: string;
  description?: string;
  type: PriceRuleType;
  adjustmentType: 'PERCENTAGE' | 'FIXED';
  adjustmentValue: number;
  conditions: {
    time?: TimeCondition;
    day?: DayCondition;
    date?: DateCondition;
    duration?: DurationCondition;
  };
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricingFactors {
  timeOfDay: number;
  dayOfWeek: number;
  seasonality: number;
  events: number;
  occupancy: number;
  demand: number;
  competition: number;
  weather: number;
}

export interface PriceSuggestion {
  id: string;
  parkingId: string;
  algorithmType: AlgorithmType;
  suggestedPrice: number;
  currentPrice: number;
  confidence: number;
  factors: PricingFactors;
  reasoning: string;
  validFrom: string;
  validUntil: string;
  isApplied: boolean;
  appliedAt?: string;
  createdAt: string;
}

export interface PriceCalculation {
  basePrice: number;
  appliedRules: Array<{
    ruleId: string;
    name: string;
    adjustment: number;
    amount: number;
  }>;
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
  durationHours: number;
}

export interface HistoricalPricing {
  parkingId: string;
  period: {
    start: string;
    end: string;
  };
  data: Array<{
    date: string;
    price: number;
    bookings: number;
    revenue: number;
    occupancyRate: number;
  }>;
}

export interface PricingAnalysis {
  parkingId: string;
  period: {
    start: string;
    end: string;
  };
  averagePrice: number;
  optimalPrice: number;
  revenueWithCurrentPricing: number;
  projectedRevenueWithOptimalPricing: number;
  recommendations: string[];
}
