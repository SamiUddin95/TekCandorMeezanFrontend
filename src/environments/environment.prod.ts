export const environment = {
  production: true,
  apiUrl: 'https://your-production-url.com/api/',

  // Auto logout inactivity timeout (milliseconds)
  inactivityTimeout: 60 * 1000,          // 1 minute
  inactivityWarningBefore: 30 * 1000    // show warning 30 seconds before timeout
};
