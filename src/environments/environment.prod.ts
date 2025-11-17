export const environment = {
  production: true,
  apiUrl: 'https://api.parkshare.com/api',
  wsUrl: 'https://api.parkshare.com',
  stripePublishableKey: 'pk_live_your_key_here',
  googleMapsApiKey: 'your_google_maps_key_here',
  defaultLanguage: 'fr',
  supportedLanguages: ['en', 'fr'],
  tokenRefreshInterval: 840000,
  imageUploadMaxSize: 5242880,
  imageUploadAllowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  map: {
    defaultCenter: { lat: 48.8566, lng: 2.3522 },
    defaultZoom: 13,
    searchRadius: 5000
  }
};
