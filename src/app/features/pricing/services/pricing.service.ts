import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  PriceRule,
  PriceSuggestion,
  PriceCalculation,
  HistoricalPricing,
  PricingAnalysis
} from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private api = inject(ApiService);

  // Price Rules
  createPriceRule(data: Partial<PriceRule>): Observable<PriceRule> {
    return this.api.post<PriceRule>(API_ENDPOINTS.PRICE_RULES.BASE, data);
  }

  getPriceRules(parkingId: string): Observable<PriceRule[]> {
    return this.api.get<PriceRule[]>(API_ENDPOINTS.PRICE_RULES.BY_PARKING(parkingId));
  }

  getPriceRuleById(id: string): Observable<PriceRule> {
    return this.api.get<PriceRule>(API_ENDPOINTS.PRICE_RULES.BY_ID(id));
  }

  updatePriceRule(id: string, data: Partial<PriceRule>): Observable<PriceRule> {
    return this.api.patch<PriceRule>(API_ENDPOINTS.PRICE_RULES.BY_ID(id), data);
  }

  deletePriceRule(id: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.PRICE_RULES.BY_ID(id));
  }

  calculatePrice(parkingId: string, startDate: string, endDate: string): Observable<PriceCalculation> {
    return this.api.get<PriceCalculation>(
      API_ENDPOINTS.PRICE_RULES.CALCULATE(parkingId),
      { startDate, endDate }
    );
  }

  // Dynamic Pricing
  suggestPrice(parkingId: string): Observable<PriceSuggestion> {
    return this.api.post<PriceSuggestion>(API_ENDPOINTS.PRICING.SUGGEST, { parkingId });
  }

  getSuggestions(): Observable<PriceSuggestion[]> {
    return this.api.get<PriceSuggestion[]>(API_ENDPOINTS.PRICING.SUGGESTIONS);
  }

  getSuggestionById(id: string): Observable<PriceSuggestion> {
    return this.api.get<PriceSuggestion>(API_ENDPOINTS.PRICING.SUGGESTION_BY_ID(id));
  }

  applySuggestion(id: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.PRICING.APPLY_SUGGESTION(id), {});
  }

  getPriceForRange(parkingId: string, startDate: string, endDate: string): Observable<number> {
    return this.api.get<number>(API_ENDPOINTS.PRICING.PRICE_FOR_RANGE, {
      parkingId,
      startDate,
      endDate
    });
  }

  getHistoricalPricing(parkingId: string, startDate: string, endDate: string): Observable<HistoricalPricing> {
    return this.api.get<HistoricalPricing>(
      API_ENDPOINTS.PRICING.HISTORICAL(parkingId),
      { startDate, endDate }
    );
  }

  getPricingAnalysis(parkingId: string, startDate: string, endDate: string): Observable<PricingAnalysis> {
    return this.api.get<PricingAnalysis>(
      API_ENDPOINTS.PRICING.ANALYSIS(parkingId),
      { startDate, endDate }
    );
  }
}
