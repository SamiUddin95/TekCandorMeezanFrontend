const ONES = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
    if (n < 20) return ONES[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return TENS[t] + (o ? ' ' + ONES[o] : '');
}

function threeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const parts: string[] = [];
    if (h) parts.push(ONES[h] + ' Hundred');
    if (rest) parts.push(twoDigits(rest));
    return parts.join(' ');
}

export function amountToWords(amount: number | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
        return 'Zero Rupees Only';
    }

    const rupees = Math.floor(amount);
    const paisa = Math.round((amount - rupees) * 100);

    if (rupees === 0 && paisa === 0) {
        return 'Zero Rupees Only';
    }

    // Indian numbering: crore, lakh, thousand, hundred
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;

    const parts: string[] = [];
    if (crore) parts.push(twoDigits(crore) + ' Crore');
    if (lakh) parts.push(twoDigits(lakh) + ' Lakh');
    if (thousand) parts.push(twoDigits(thousand) + ' Thousand');
    if (hundred) parts.push(threeDigits(hundred));

    let result = parts.join(' ').trim() + ' Rupees';
    if (paisa > 0) {
        result += ' and ' + twoDigits(paisa) + ' Paisa';
    }
    result += ' Only';
    return result;
}
