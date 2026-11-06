import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, delay, map, shareReplay, switchMap, timeout } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface ScannerScanSettings {
    img_format: string;
    img_type: string;
    img_resolution: string;
    brightness: string;
    contrast: string;
    img_quality: string;
}

export interface RawScannedCheque {
    sequenceNumber?: number;
    files?: { [key: string]: unknown };
    MICR?: string;
    MICR_OCR?: string;
    [key: string]: unknown;
}

export interface ScannerBatchResponse {
    batchId?: string;
    totalCheques?: number;
    cheques?: RawScannedCheque[];
    [key: string]: unknown;
}

export interface NormalizedScannedCheque {
    sequenceNumber: number;
    frontImage: string;
    backImage: string;
    uvImage: string;
    micr: string;
    micrOcr: string;
    /** true = MICR and MICR_OCR match (valid), false = mismatch (suspected fraud), null = not enough data */
    micrMatch: boolean | null;
    chequeNo: string;
}

export interface ScanBatchResult {
    source: 'device' | 'demo';
    batchId: string;
    totalCheques: number;
    cheques: NormalizedScannedCheque[];
}

const DEFAULT_SCAN_SETTINGS: ScannerScanSettings = {
    img_format: 'jpg',
    img_type: 'uv_gray',
    img_resolution: '300',
    brightness: '50',
    contrast: '-10',
    img_quality: '60'
};

@Injectable({ providedIn: 'root' })
export class ChequeScannerService {

    private readonly baseUrl: string = (environment as any).scannerApiUrl || 'http://localhost:6077';

    constructor(private http: HttpClient) {}

    /**
     * Resolved scanner mode:
     *  - 'demo'  -> always return sample data (no device call)
     *  - 'live'  -> device only, propagate errors
     *  - 'auto'  -> try device, silently fall back to demo data when unavailable
     * Can be overridden per-session via ?scanner=demo|live|auto query param.
     */
    get scannerMode(): 'auto' | 'live' | 'demo' {
        const q = new URLSearchParams(window.location.search).get('scanner');
        if (q === 'demo' || q === 'live' || q === 'auto') return q;
        return (environment as any).scannerMode || 'auto';
    }

    scanBatch(batchId = ''): Observable<ScanBatchResult> {
        const mode = this.scannerMode;
        if (mode === 'demo') {
            return this.demoResult(batchId, 1200);
        }
        const live$ = this.scanFromDevice().pipe(
            map(res => this.normalizeResponse(res, batchId))
        );
        if (mode === 'live') return live$;
        return live$.pipe(
            catchError(() => this.demoResult(batchId, 800))
        );
    }

    // ── Device flow: connect -> start feed -> close ───────────────────────

    private scanFromDevice(): Observable<ScannerBatchResponse> {
        return this.http.post(`${this.baseUrl}/connect_device`, {}).pipe(
            timeout(5000),
            switchMap(() =>
                this.http.post<ScannerBatchResponse>(`${this.baseUrl}/start_feed`, DEFAULT_SCAN_SETTINGS).pipe(
                    timeout(120000),
                    switchMap(res => this.closeDevice().pipe(map(() => res))),
                    catchError(err => this.closeDevice().pipe(switchMap(() => throwError(() => err))))
                )
            )
        );
    }

    private closeDevice(): Observable<unknown> {
        return this.http.post(`${this.baseUrl}/close_device`, {}).pipe(
            timeout(5000),
            catchError(() => of(null))
        );
    }

    // ── Response normalization ────────────────────────────────────────────

    private normalizeResponse(res: ScannerBatchResponse, batchId: string, source: 'device' | 'demo' = 'device'): ScanBatchResult {
        const rawCheques: RawScannedCheque[] = Array.isArray(res?.cheques)
            ? res.cheques
            : (res && Object.keys(res).length ? [res as RawScannedCheque] : []);
        const cheques = rawCheques.map((c, i) => this.normalizeCheque(c, i));
        return {
            source,
            batchId: res?.batchId || batchId,
            totalCheques: res?.totalCheques ?? cheques.length,
            cheques
        };
    }

    private normalizeCheque(raw: RawScannedCheque, index: number): NormalizedScannedCheque {
        const files = (raw?.files && typeof raw.files === 'object' ? raw.files : raw) as { [key: string]: unknown };
        const micr = this.normalizeMicrValue(this.pickString(raw, ['MICR', 'micr', 'micrLine', 'Micr', 'micrCode']));
        const micrOcr = this.normalizeMicrValue(this.pickString(raw, ['MICR_OCR', 'micrOcr', 'MICROCR', 'micr_ocr', 'MicrOcr']));
        const micrMatch = (micr && micrOcr) ? micr === micrOcr : null;
        return {
            sequenceNumber: raw?.sequenceNumber ?? index + 1,
            frontImage: this.pickImage(files, ChequeScannerService.FRONT_KEYS),
            backImage: this.pickImage(files, ChequeScannerService.BACK_KEYS),
            uvImage: this.pickImage(files, ChequeScannerService.UV_KEYS),
            micr,
            micrOcr,
            micrMatch,
            chequeNo: this.extractChequeNo(micr)
        };
    }

    private pickString(obj: { [key: string]: unknown } | undefined, keys: string[]): string {
        if (!obj) return '';
        for (const key of keys) {
            const entry = Object.entries(obj).find(([k]) => k.toLowerCase() === key.toLowerCase());
            if (entry && typeof entry[1] === 'string' && entry[1]) return entry[1] as string;
        }
        return '';
    }

    /** Known device response image field names (exact match tried first, then 'contains' fallback). */
    private static readonly FRONT_KEYS = ['frontImgBase64', 'frontImageBase64', 'frontImg', 'frontImage', 'imageF', 'front'];
    private static readonly BACK_KEYS = ['backImgBase64', 'backImageBase64', 'backImg', 'backImage', 'rearImgBase64', 'imageB', 'back', 'rear'];
    private static readonly UV_KEYS = ['frontUVImgBase64', 'uvImgBase64', 'uvImageBase64', 'backUVImgBase64', 'uvImg', 'uvImage', 'imageU', 'uv', 'ultra'];

    private pickImage(files: { [key: string]: unknown }, candidates: string[]): string {
        const entries = Object.entries(files).filter(([, v]) => typeof v === 'string' && (v as string).length > 0);
        // 1) exact key match (case-insensitive) — avoids 'frontUVImgBase64' matching 'front'
        for (const key of candidates) {
            const hit = entries.find(([k]) => k.toLowerCase() === key.toLowerCase());
            if (hit) return this.ensureDataUri(hit[1] as string);
        }
        // 2) fuzzy 'contains' match as a fallback for unknown field names
        for (const key of candidates) {
            const hit = entries.find(([k]) => k.toLowerCase().includes(key.toLowerCase()));
            if (hit) return this.ensureDataUri(hit[1] as string);
        }
        return '';
    }

    /**
     * Accepts a base64 data URI (device response) or a raw base64 string and
     * returns a value safe to bind directly to <img [src]>. File names and
     * asset paths are intentionally NOT rendered — the scanner response always
     * carries base64 image data.
     */
    private ensureDataUri(value: string): string {
        const v = (value || '').trim();
        if (!v) return '';
        if (v.startsWith('data:image/')) return v;
        if (/^[A-Za-z0-9+/=\s]+$/.test(v) && v.replace(/\s/g, '').length > 500) {
            return `data:image/jpeg;base64,${v.replace(/\s/g, '')}`;
        }
        return '';
    }

    /** Decode HTML entities (&lt; etc.) and strip whitespace so equivalent MICR lines compare equal. */
    private normalizeMicrValue(value: string): string {
        return (value || '')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#0?39;/gi, "'")
            .replace(/\s+/g, '')
            .trim();
    }

    private extractChequeNo(micr: string): string {
        if (!micr) return '';
        const segments = micr.split(/[<>:=\u2446\u2447\u2448\u2449\s]+/).filter(s => /^\d{4,}$/.test(s));
        return segments[0] || '';
    }

    // ── Demo fallback (no physical scanner connected) ─────────────────────
    // 1) Preferred: a saved real device response at DEMO_RESPONSE_URL — it is
    //    parsed through the exact same normalizeResponse() path as live data,
    //    so the demo output is identical in shape to a /start_feed response.
    // 2) Fallback: real scanned cheque images bundled in assets, converted to
    //    base64 data URIs.

    private static readonly DEMO_RESPONSE_URL = 'assets/data/demo-scan-response.json';

    private static readonly DEMO_ASSETS = {
        front: 'assets/images/110100117F.jpg',
        back: 'assets/images/110100117B.jpg',
        uv: 'assets/images/110100117U.jpg'
    };

    private demoImages$: Observable<{ front: string; back: string; uv: string }> | null = null;
    private demoResponse$: Observable<ScannerBatchResponse | null> | null = null;

    private demoResult(batchId: string, simulateMs: number): Observable<ScanBatchResult> {
        return this.loadStaticDemoResponse().pipe(
            switchMap(res =>
                res
                    ? of(this.normalizeResponse(res, batchId, 'demo'))
                    : this.loadDemoImages().pipe(map(images => this.buildDemoResult(batchId, images)))
            ),
            delay(simulateMs)
        );
    }

    /**
     * Reads a previously captured real /start_feed response from assets.
     * Returns null when the file is absent or unusable (e.g. image values are empty),
     * so the caller can fall back to the bundled asset images.
     */
    private loadStaticDemoResponse(): Observable<ScannerBatchResponse | null> {
        if (!this.demoResponse$) {
            this.demoResponse$ = this.http.get<ScannerBatchResponse>(ChequeScannerService.DEMO_RESPONSE_URL).pipe(
                map(res => this.isUsableStaticResponse(res) ? res : null),
                catchError(() => of(null)),
                shareReplay(1)
            );
        }
        return this.demoResponse$;
    }

    private isUsableStaticResponse(res: ScannerBatchResponse | null): res is ScannerBatchResponse {
        if (!res || !Array.isArray(res.cheques) || !res.cheques.length) return false;
        // ensure at least one cheque actually carries an image value
        // (base64 data URI, raw base64, or an asset path)
        return res.cheques.some(c => {
            const files = c?.files;
            return !!files && Object.values(files).some(v => typeof v === 'string' && (v as string).trim().length > 0);
        });
    }

    private loadDemoImages(): Observable<{ front: string; back: string; uv: string }> {
        if (!this.demoImages$) {
            this.demoImages$ = forkJoin({
                front: this.loadAssetAsDataUri(ChequeScannerService.DEMO_ASSETS.front),
                back: this.loadAssetAsDataUri(ChequeScannerService.DEMO_ASSETS.back),
                uv: this.loadAssetAsDataUri(ChequeScannerService.DEMO_ASSETS.uv)
            }).pipe(shareReplay(1));
        }
        return this.demoImages$;
    }

    private loadAssetAsDataUri(path: string): Observable<string> {
        return this.http.get(path, { responseType: 'blob' }).pipe(
            switchMap(blob => this.blobToDataUri(blob)),
            catchError(() => of(''))
        );
    }

    private blobToDataUri(blob: Blob): Observable<string> {
        return new Observable<string>(subscriber => {
            const reader = new FileReader();
            reader.onload = () => {
                subscriber.next(reader.result as string);
                subscriber.complete();
            };
            reader.onerror = () => subscriber.error(reader.error);
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Builds a raw ScannerBatchResponse (same shape and field names as a real
     * /start_feed response) and runs it through normalizeResponse() so demo and
     * live data share one code path.
     */
    private buildDemoResult(batchId: string, images: { front: string; back: string; uv: string }): ScanBatchResult {
        const raw: ScannerBatchResponse = {
            batchId,
            totalCheques: 1,
            cheques: [
                {
                    sequenceNumber: 1,
                    files: {
                        frontImgBase64: images.front,
                        backImgBase64: images.back,
                        frontUVImgBase64: images.uv
                    },
                    MICR: '<61807824<0890103:0001030107104945<000=',
                    MICR_OCR: '<61807824<0890103:0001030107104945<000='
                }
            ]
        };
        return this.normalizeResponse(raw, batchId, 'demo');
    }
}
