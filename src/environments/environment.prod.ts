export const environment = {
  production: true,
  apiUrl: 'https://your-production-url.com/api/',

  // Auto logout inactivity timeout (milliseconds)
  inactivityTimeout: 300 * 1000,          // 1 minute
  inactivityWarningBefore: 270 * 1000,    // show warning 30 seconds before timeout

  // Cheque scanner device (Bancor Web API)
  // Direct device URL — the device sends Access-Control-Allow-Origin: * and the
  // auth interceptor skips scanner calls. Alternatively deploy a reverse-proxy
  // for '/scanner-api' -> http://localhost:6077 and use that path here.
  scannerApiUrl: 'http://localhost:6077',
  // 'auto' = try device, fall back to demo data when unavailable
  // 'live' = device only | 'demo' = always sample data (no device call)
  scannerMode: 'auto' as 'auto' | 'live' | 'demo'
};
