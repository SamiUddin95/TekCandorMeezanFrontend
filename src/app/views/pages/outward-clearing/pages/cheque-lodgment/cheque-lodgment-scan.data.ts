export interface ChequeLodgmentScanData {
    chequeNumber: string;
    micrCode: string;
    amount: number;
    chequeDate: string;
    beneficiary: string;
    ocrEngine: string;
    processingTime: string;
    confidenceScore: number;
    instrumentType: string;
    currency: string;
    payingBankCode: string;
    payingBranchCode: string;
}

export const CHEQUE_LODGMENT_SCAN_DATA: ChequeLodgmentScanData = {
    chequeNumber: '00129485',
    micrCode: '043002008: 00129485: 01',
    amount: 145000,
    chequeDate: '2026-04-08',
    beneficiary: 'AL-BARAKA TEXTILES PVT LTD',
    ocrEngine: 'Vision-v4.0',
    processingTime: '0.8s',
    confidenceScore: 98.4,
    instrumentType: 'Cheque',
    currency: 'PKR',
    payingBankCode: '043002',
    payingBranchCode: '008'
};
