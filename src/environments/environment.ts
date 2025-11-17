export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'http://localhost:3000',
  stripePublishableKey: 'pk_test_your_key_here',
  googleMapsApiKey: 'your_google_maps_key_here',
  defaultLanguage: 'fr',
  supportedLanguages: ['en', 'fr'],
  tokenRefreshInterval: 840000, // 14 minutes (tokens expire at 15)
  imageUploadMaxSize: 5242880, // 5MB
  imageUploadAllowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  map: {
    defaultCenter: { lat: 48.8566, lng: 2.3522 }, // Paris
    defaultZoom: 13,
    searchRadius: 5000 // 5km
  }
};
