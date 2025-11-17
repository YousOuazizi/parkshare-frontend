import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  SwapListing,
  SwapOffer,
  SwapTransaction,
  CreateSwapListingRequest,
  CreateSwapOfferRequest
} from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class SwapService {
  private api = inject(ApiService);

  // Listings
  createListing(data: CreateSwapListingRequest): Observable<SwapListing> {
    return this.api.post<SwapListing>(API_ENDPOINTS.SWAP.LISTINGS.BASE, data);
  }

  getListings(params?: any): Observable<SwapListing[]> {
    return this.api.get<SwapListing[]>(API_ENDPOINTS.SWAP.LISTINGS.BASE, params);
  }

  getMyListings(): Observable<SwapListing[]> {
    return this.api.get<SwapListing[]>(API_ENDPOINTS.SWAP.LISTINGS.MY_LISTINGS);
  }

  getListingById(id: string): Observable<SwapListing> {
    return this.api.get<SwapListing>(API_ENDPOINTS.SWAP.LISTINGS.BY_ID(id));
  }

  updateListing(id: string, data: Partial<CreateSwapListingRequest>): Observable<SwapListing> {
    return this.api.patch<SwapListing>(API_ENDPOINTS.SWAP.LISTINGS.BY_ID(id), data);
  }

  cancelListing(id: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.SWAP.LISTINGS.CANCEL(id), {});
  }

  // Offers
  createOffer(data: CreateSwapOfferRequest): Observable<SwapOffer> {
    return this.api.post<SwapOffer>(API_ENDPOINTS.SWAP.OFFERS.BASE, data);
  }

  getOffers(): Observable<SwapOffer[]> {
    return this.api.get<SwapOffer[]>(API_ENDPOINTS.SWAP.OFFERS.BASE);
  }

  getOfferById(id: string): Observable<SwapOffer> {
    return this.api.get<SwapOffer>(API_ENDPOINTS.SWAP.OFFERS.BY_ID(id));
  }

  updateOffer(id: string, data: Partial<CreateSwapOfferRequest>): Observable<SwapOffer> {
    return this.api.patch<SwapOffer>(API_ENDPOINTS.SWAP.OFFERS.BY_ID(id), data);
  }

  cancelOffer(id: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.SWAP.OFFERS.CANCEL(id), {});
  }

  respondToOffer(id: string, accept: boolean, message?: string): Observable<SwapOffer> {
    return this.api.post<SwapOffer>(API_ENDPOINTS.SWAP.OFFERS.RESPOND(id), { accept, message });
  }

  completeSwap(id: string): Observable<SwapOffer> {
    return this.api.post<SwapOffer>(API_ENDPOINTS.SWAP.OFFERS.COMPLETE(id), {});
  }

  // Transactions
  getTransactions(): Observable<SwapTransaction[]> {
    return this.api.get<SwapTransaction[]>(API_ENDPOINTS.SWAP.TRANSACTIONS.BASE);
  }

  getTransactionById(id: string): Observable<SwapTransaction> {
    return this.api.get<SwapTransaction>(API_ENDPOINTS.SWAP.TRANSACTIONS.BY_ID(id));
  }
}
