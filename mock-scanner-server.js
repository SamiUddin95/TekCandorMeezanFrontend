/**
 * Mock Bancor cheque-scanner device service.
 *
 * Simulates the real device API that normally runs on http://localhost:6077
 * when the scanner software is installed. Lets the Angular app exercise the
 * real live flow (connect_device -> start_feed -> close_device) without
 * hardware attached.
 *
 * Usage:
 *   node mock-scanner-server.js          -> listens on http://localhost:6077
 *
 * Then either:
 *   - set environment.ts  scannerMode: 'live'  (device calls only), or
 *   - keep scannerMode: 'auto'                 (device first, demo fallback)
 *   - or append ?scanner=live to the page URL.
 *
 * Stop this script to simulate "device not connected" — the app then falls
 * back to the static demo response (assets/data/demo-scan-response.json).
 *
 * The /start_feed response is read from src/assets/data/demo-scan-response.json
 * so the mock returns exactly the same payload the UI uses in demo mode.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.SCANNER_PORT || 6077;
const RESPONSE_FILE = path.join(__dirname, 'src', 'assets', 'data', 'demo-scan-response.json');

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, status, body) {
    setCors(res);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = (req.url || '').split('?')[0];
    console.log(`[mock-scanner] ${req.method} ${url}`);

    if (url === '/connect_device') {
        return sendJson(res, 200, { status: 'connected', device: 'Bancor Cheque Scanner (MOCK)' });
    }

    if (url === '/start_feed') {
        // simulate scanner hardware taking a moment to capture
        return setTimeout(() => {
            try {
                const payload = JSON.parse(fs.readFileSync(RESPONSE_FILE, 'utf8'));
                sendJson(res, 200, payload);
            } catch (e) {
                sendJson(res, 500, { error: 'Failed to read demo-scan-response.json', detail: String(e) });
            }
        }, 800);
    }

    if (url === '/close_device') {
        return sendJson(res, 200, { status: 'closed' });
    }

    sendJson(res, 404, { error: 'Unknown endpoint', url });
});

server.listen(PORT, () => {
    console.log(`Mock Bancor scanner service running at http://localhost:${PORT}`);
    console.log(`Serving cheques from: ${RESPONSE_FILE}`);
});
