const PROXY_CONFIG = [
  {
    context: "/ReportServer",
    target: "http://muhammad-ameen",
    secure: false,
    changeOrigin: true,
    logLevel: "debug",
    headers: {
      "Authorization": "Basic " + Buffer.from("MUHAMMAD-AMEEN:02022003").toString("base64")
    }
  },
  {
    // Bancor cheque-scanner device service (localhost:6077) — proxied through
    // the Angular dev server so browser calls stay same-origin and avoid CORS.
    context: "/scanner-api",
    target: "http://localhost:6077",
    secure: false,
    changeOrigin: true,
    pathRewrite: { "^/scanner-api": "" }
  }
];

module.exports = PROXY_CONFIG;
