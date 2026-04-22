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
  }
];

module.exports = PROXY_CONFIG;
