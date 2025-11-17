#!/bin/bash

echo "Generating ParkShare Angular Frontend Structure..."

# Core Services
ng generate service core/services/auth --skip-tests
ng generate service core/services/api --skip-tests
ng generate service core/services/storage --skip-tests
ng generate service core/services/notification --skip-tests
ng generate service core/services/websocket --skip-tests
ng generate service core/services/theme --skip-tests

# Feature Services
ng generate service features/parking/services/parking --skip-tests
ng generate service features/booking/services/booking --skip-tests
ng generate service features/payment/services/payment --skip-tests
ng generate service features/review/services/review --skip-tests
ng generate service features/subscription/services/subscription --skip-tests
ng generate service features/swap/services/swap --skip-tests
ng generate service features/pricing/services/pricing --skip-tests
ng generate service features/verification/services/verification --skip-tests
ng generate service features/gdpr/services/gdpr --skip-tests
ng generate service features/analytics/services/analytics --skip-tests

# Interceptors
ng generate interceptor core/interceptors/auth --skip-tests
ng generate interceptor core/interceptors/error --skip-tests
ng generate interceptor core/interceptors/loading --skip-tests

# Guards
ng generate guard core/guards/auth --skip-tests
ng generate guard core/guards/verification-level --skip-tests
ng generate guard core/guards/role --skip-tests

# Shared Components
ng generate component shared/components/header --standalone --skip-tests
ng generate component shared/components/footer --standalone --skip-tests
ng generate component shared/components/sidebar --standalone --skip-tests
ng generate component shared/components/loading-spinner --standalone --skip-tests
ng generate component shared/components/error-message --standalone --skip-tests
ng generate component shared/components/confirmation-dialog --standalone --skip-tests
ng generate component shared/components/rating-stars --standalone --skip-tests
ng generate component shared/components/file-upload --standalone --skip-tests
ng generate component shared/components/map --standalone --skip-tests
ng generate component shared/components/qr-code --standalone --skip-tests

# Shared Pipes
ng generate pipe shared/pipes/time-ago --standalone --skip-tests
ng generate pipe shared/pipes/distance --standalone --skip-tests
ng generate pipe shared/pipes/currency-format --standalone --skip-tests

# Shared Directives
ng generate directive shared/directives/lazy-load --standalone --skip-tests
ng generate directive shared/directives/click-outside --standalone --skip-tests

# Feature Components
echo "Creating feature modules..."

# Auth Feature
ng generate component features/auth/pages/login --standalone --skip-tests
ng generate component features/auth/pages/register --standalone --skip-tests
ng generate component features/auth/pages/forgot-password --standalone --skip-tests
ng generate component features/auth/pages/profile --standalone --skip-tests

# Parking Feature
ng generate component features/parking/pages/parking-list --standalone --skip-tests
ng generate component features/parking/pages/parking-detail --standalone --skip-tests
ng generate component features/parking/pages/parking-create --standalone --skip-tests
ng generate component features/parking/pages/my-parkings --standalone --skip-tests
ng generate component features/parking/components/parking-card --standalone --skip-tests
ng generate component features/parking/components/parking-form --standalone --skip-tests
ng generate component features/parking/components/parking-map --standalone --skip-tests
ng generate component features/parking/components/availability-calendar --standalone --skip-tests

# Booking Feature
ng generate component features/booking/pages/booking-list --standalone --skip-tests
ng generate component features/booking/pages/booking-detail --standalone --skip-tests
ng generate component features/booking/pages/create-booking --standalone --skip-tests
ng generate component features/booking/components/booking-card --standalone --skip-tests
ng generate component features/booking/components/booking-calendar --standalone --skip-tests

# Payment Feature
ng generate component features/payment/pages/payment-list --standalone --skip-tests
ng generate component features/payment/pages/payment-detail --standalone --skip-tests
ng generate component features/payment/components/payment-form --standalone --skip-tests
ng generate component features/payment/components/payment-method-card --standalone --skip-tests

# Review Feature
ng generate component features/review/pages/review-list --standalone --skip-tests
ng generate component features/review/components/review-card --standalone --skip-tests
ng generate component features/review/components/review-form --standalone --skip-tests
ng generate component features/review/components/review-stats --standalone --skip-tests

# Subscription Feature
ng generate component features/subscription/pages/subscription-plans --standalone --skip-tests
ng generate component features/subscription/pages/my-subscriptions --standalone --skip-tests
ng generate component features/subscription/components/plan-card --standalone --skip-tests
ng generate component features/subscription/components/subscription-card --standalone --skip-tests

# Swap Feature
ng generate component features/swap/pages/swap-listings --standalone --skip-tests
ng generate component features/swap/pages/my-swap-listings --standalone --skip-tests
ng generate component features/swap/pages/swap-offers --standalone --skip-tests
ng generate component features/swap/components/swap-listing-card --standalone --skip-tests
ng generate component features/swap/components/swap-offer-card --standalone --skip-tests

# Verification Feature
ng generate component features/verification/pages/verification-wizard --standalone --skip-tests
ng generate component features/verification/components/email-verification --standalone --skip-tests
ng generate component features/verification/components/phone-verification --standalone --skip-tests
ng generate component features/verification/components/document-upload --standalone --skip-tests
ng generate component features/verification/components/verification-progress --standalone --skip-tests

# Pricing Feature
ng generate component features/pricing/pages/pricing-dashboard --standalone --skip-tests
ng generate component features/pricing/components/price-chart --standalone --skip-tests
ng generate component features/pricing/components/price-suggestion-card --standalone --skip-tests

# Analytics Feature
ng generate component features/analytics/pages/user-dashboard --standalone --skip-tests
ng generate component features/analytics/pages/owner-dashboard --standalone --skip-tests
ng generate component features/analytics/pages/admin-dashboard --standalone --skip-tests

# GDPR Feature
ng generate component features/gdpr/pages/consent-management --standalone --skip-tests
ng generate component features/gdpr/pages/data-export --standalone --skip-tests
ng generate component features/gdpr/pages/data-deletion --standalone --skip-tests

# Notification Feature
ng generate component features/notification/pages/notification-list --standalone --skip-tests
ng generate component features/notification/components/notification-card --standalone --skip-tests
ng generate component features/notification/components/notification-bell --standalone --skip-tests

# Admin Feature
ng generate component features/admin/pages/user-management --standalone --skip-tests
ng generate component features/admin/pages/parking-verification --standalone --skip-tests
ng generate component features/admin/pages/system-health --standalone --skip-tests

echo "Structure generation complete!"
