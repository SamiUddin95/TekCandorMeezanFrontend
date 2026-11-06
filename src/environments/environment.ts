export const environment = {
  production: false,
  // apiUrl: 'http://13.58.156.144/api/'
  // apiUrl: 'https://localhost:7208/api'
  apiUrl: 'https://localhost:44367/api',
  //apiUrl: '/api',
  //apiUrl: ' https://tek.teknoloje.com/api',

  // Auto logout inactivity timeout (milliseconds)
  inactivityTimeout: 5 * 60 * 1000,      // 5 minutes
  inactivityWarningBefore: 30 * 1000,    // show warning 30 seconds before timeout

  // Cheque scanner device (Bancor Web API)
  // Direct device URL — works cross-origin because the device sends
  // Access-Control-Allow-Origin: * and the auth interceptor skips scanner calls.
  // '/scanner-api' also works when the dev-server proxy (proxy.conf.js) is active.
  scannerApiUrl: 'http://localhost:6077',
  // 'auto' = try device, fall back to demo data when unavailable
  // 'live' = device only | 'demo' = always sample data (no device call)
  scannerMode: 'auto' as 'auto' | 'live' | 'demo'
};

