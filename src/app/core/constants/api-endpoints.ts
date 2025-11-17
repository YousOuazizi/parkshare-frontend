export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    VERIFICATION_REQUIREMENTS: '/users/verification-requirements'
  },

  // Verification
  VERIFICATION: {
    BASE: '/verification',
    EMAIL_REQUEST: '/verification/email/request',
    EMAIL_VERIFY: '/verification/email/verify',
    PHONE_REQUEST: '/verification/phone/request',
    PHONE_VERIFY: '/verification/phone/verify',
    DOCUMENT_UPLOAD: '/verification/document/upload',
    IDENTITY_APPROVE: (userId: string) => `/verification/identity/approve/${userId}`,
    ADVANCED_APPROVE: (userId: string) => `/verification/advanced/approve/${userId}`
  },

  // Parkings
  PARKINGS: {
    BASE: '/parkings',
    BY_ID: (id: string) => `/parkings/${id}`,
    SEARCH: '/parkings/search',
    CHECK_AVAILABILITY: (id: string) => `/parkings/${id}/check-availability`
  },

  // Price Rules
  PRICE_RULES: {
    BASE: '/price-rules',
    BY_ID: (id: string) => `/price-rules/${id}`,
    BY_PARKING: (parkingId: string) => `/price-rules?parkingId=${parkingId}`,
    CALCULATE: (parkingId: string) => `/price-rules/calculate-price/${parkingId}`
  },

  // Bookings
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
    CHECK_IN: (id: string) => `/bookings/${id}/check-in`,
    CHECK_OUT: (id: string) => `/bookings/${id}/check-out`,
    ACCESS_CODE: (id: string) => `/bookings/${id}/access-code`,
    STATS_USER: '/bookings/stats/user',
    STATS_PARKING: (parkingId: string) => `/bookings/stats/parking/${parkingId}`
  },

  // Payments
  PAYMENTS: {
    BASE: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
    BY_BOOKING: (bookingId: string) => `/payments/booking/${bookingId}`,
    ADMIN: '/payments/admin',
    WEBHOOK: '/payments/webhook',
    REFUND: '/payments/refund'
  },

  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    BY_ID: (id: string) => `/reviews/${id}`,
    REPLY: (id: string) => `/reviews/${id}/reply`,
    REPORT: (id: string) => `/reviews/${id}/report`,
    STATS_PARKING: (parkingId: string) => `/reviews/stats/parking/${parkingId}`,
    STATS_USER: (userId: string) => `/reviews/stats/user/${userId}`
  },

  // Pricing
  PRICING: {
    SUGGEST: '/pricing/suggest',
    SUGGESTIONS: '/pricing/suggestions',
    SUGGESTION_BY_ID: (id: string) => `/pricing/suggestions/${id}`,
    APPLY_SUGGESTION: (id: string) => `/pricing/suggestions/${id}/apply`,
    PRICE_FOR_RANGE: '/pricing/price-for-range',
    HISTORICAL: (parkingId: string) => `/pricing/historical/${parkingId}`,
    ANALYSIS: (parkingId: string) => `/pricing/analysis/${parkingId}`
  },

  // Subscription Plans
  SUBSCRIPTION_PLANS: {
    BASE: '/subscription-plans',
    BY_ID: (id: string) => `/subscription-plans/${id}`,
    BY_TYPE: (type: string) => `/subscription-plans/type/${type}`,
    BY_RECURRENCE: (recurrence: string) => `/subscription-plans/recurrence/${recurrence}`
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    BY_ID: (id: string) => `/subscriptions/${id}`,
    CANCEL: (id: string) => `/subscriptions/${id}/cancel`,
    PAUSE: (id: string) => `/subscriptions/${id}/pause`,
    RESUME: (id: string) => `/subscriptions/${id}/resume`,
    SHARE: (id: string) => `/subscriptions/${id}/share`,
    ACCEPT_SHARE: (id: string) => `/subscriptions/sharing/${id}/accept`,
    REJECT_SHARE: (id: string) => `/subscriptions/sharing/${id}/reject`,
    REVOKE_SHARE: (id: string) => `/subscriptions/sharing/${id}/revoke`,
    USAGE: (id: string) => `/subscriptions/${id}/usage`,
    CHECK_ACCESS: (parkingId: string) => `/subscriptions/check-access/${parkingId}`
  },

  // Spot Swap
  SWAP: {
    LISTINGS: {
      BASE: '/spot-swap/listings',
      MY_LISTINGS: '/spot-swap/listings/my-listings',
      BY_ID: (id: string) => `/spot-swap/listings/${id}`,
      CANCEL: (id: string) => `/spot-swap/listings/${id}/cancel`
    },
    OFFERS: {
      BASE: '/spot-swap/offers',
      BY_ID: (id: string) => `/spot-swap/offers/${id}`,
      CANCEL: (id: string) => `/spot-swap/offers/${id}/cancel`,
      RESPOND: (id: string) => `/spot-swap/offers/${id}/respond`,
      COMPLETE: (id: string) => `/spot-swap/offers/${id}/complete`
    },
    TRANSACTIONS: {
      BASE: '/spot-swap/transactions',
      BY_ID: (id: string) => `/spot-swap/transactions/${id}`
    }
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    COUNT: '/notifications/count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all'
  },

  // Analytics
  ANALYTICS: {
    TRACK: '/analytics/track',
    DASHBOARD: '/analytics/dashboard',
    USER: '/analytics/user',
    PARKING: (parkingId: string) => `/analytics/parking/${parkingId}`
  },

  // GDPR
  GDPR: {
    CONSENT: '/gdpr/consent',
    CONSENTS: '/gdpr/consents',
    WITHDRAW_CONSENT: (type: string) => `/gdpr/consent/withdraw/${type}`,
    DATA_EXPORT: '/gdpr/data-export',
    DATA_EXPORT_REQUESTS: '/gdpr/data-export/requests',
    DATA_EXPORT_DOWNLOAD: (requestId: string) => `/gdpr/data-export/${requestId}/download`,
    DATA_DELETION: '/gdpr/data-deletion',
    DATA_DELETION_REQUESTS: '/gdpr/data-deletion/requests',
    ADMIN: {
      DELETION_REQUESTS: '/gdpr/admin/deletion-requests',
      APPROVE_DELETION: (id: string) => `/gdpr/admin/deletion-requests/${id}/approve`,
      REJECT_DELETION: (id: string) => `/gdpr/admin/deletion-requests/${id}/reject`,
      EXECUTE_DELETION: (id: string) => `/gdpr/admin/deletion-requests/${id}/execute`
    }
  },

  // Health
  HEALTH: {
    BASE: '/health',
    DB: '/health/db',
    MEMORY: '/health/memory',
    DISK: '/health/disk',
    LIVENESS: '/health/liveness',
    READINESS: '/health/readiness'
  }
} as const;
