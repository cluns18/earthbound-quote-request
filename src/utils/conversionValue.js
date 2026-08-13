/**
 * Google Ads conversion value for a submitted quote request.
 *
 * This is a LOOKUP LADDER, not arithmetic, and that is the entire point. The old
 * `qty * qty * 0.5` model was unbounded: someone typing a phone number into the
 * quantity box logged multi-billion-dollar conversions that poisoned Smart Bidding
 * for weeks (Elite logged $9B, AZ $6B, and delivery died). Passing raw quantity as
 * dollars is the opposite failure — a 100-piece order reads as $100 and is worth
 * far more than that.
 *
 * A table cannot produce an out-of-range number no matter what is typed into the
 * form, which is why it is a table.
 *
 * Quantity is clamped at 5000 pieces. Value is bounded to [25, 8000] before the
 * method multiplier, and hard-capped at 10000 after it.
 */

const LADDER = [
    { under: 12, value: 25 },
    { under: 24, value: 100 },
    { under: 48, value: 300 },
    { under: 72, value: 550 },
    { under: 100, value: 850 },
    { under: 150, value: 1300 },
    { under: 250, value: 2000 },
    { under: 400, value: 3500 },
    { under: 600, value: 5000 },
    { under: 1000, value: 6800 },
];

const MAX_VALUE = 8000;
const HARD_CEILING = 10000;
const MAX_QTY = 5000;

// Earthbound runs screen print, embroidery, live-event printing and promo. Embroidery
// carries a higher ticket per piece; promo is a different margin shape entirely and is
// left at parity rather than guessed at.
const METHOD_MULTIPLIER = {
    'Screen Printing': 1,
    'Live on Site Printing': 1.15,
    Embroidery: 1.3,
    'Promotional Products': 1,
};

/**
 * @param {string|number} rawQuantity whatever the customer typed
 * @param {string[]} methods selected project types from Q1
 * @returns {number} a value safe to hand to Google Ads
 */
export function conversionValue(rawQuantity, methods = []) {
    // The quantity field is free text ("about 50", "50-75"), so pull the first number.
    const digits = String(rawQuantity ?? '').match(/\d+/);
    const qty = Math.min(digits ? parseInt(digits[0], 10) : 0, MAX_QTY);

    const base = (LADDER.find((r) => qty < r.under) || { value: MAX_VALUE }).value;

    // Several methods can be selected. Take the richest rather than compounding them,
    // which would let a four-box selection inflate the value.
    const multiplier = methods.length
        ? Math.max(...methods.map((m) => METHOD_MULTIPLIER[m] ?? 1))
        : 1;

    return Math.min(Math.round(base * multiplier), HARD_CEILING);
}

export default conversionValue;
