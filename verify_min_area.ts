import { calculateGlassCost } from './src/logic/calculator';

console.log('--- Verifying Minimum Area 0.1m2 ---');

// Case 1: Small glass (100x100mm = 0.01m2)
// Previous minimum was 0.2 -> 0.2 * UnitPrice
// New minimum is 0.1 -> 0.1 * UnitPrice
// Let's use FL5 (2400 JPY/m2)
// Expected: 0.1 * 2400 = 240 JPY.

const unitPrice = 2400;
const cost = calculateGlassCost(100, 100, unitPrice);

const expected = Math.ceil((0.1 * unitPrice) / 10) * 10; // 240

console.log(`100x100mm FL5 (2400/m2)`);
console.log(`Expected: ${expected}`);
console.log(`Actual:   ${cost}`);

if (cost === expected) {
    console.log('[PASS] Minimum area check');
} else {
    console.error('[FAIL] Minimum area check');
    process.exit(1);
}

// Case 2: Above minimum (400x400 = 0.16m2)
// Should be 0.16 * 2400 = 384 -> 390
const cost2 = calculateGlassCost(400, 400, unitPrice);
const expected2 = Math.ceil((0.16 * 2400) / 10) * 10;
console.log(`\n400x400mm FL5 (0.16m2)`);
console.log(`Expected: ${expected2}`);
console.log(`Actual:   ${cost2}`);

if (cost2 === expected2) {
    console.log('[PASS] Above minimum check');
} else {
    console.error('[FAIL] Above minimum check');
    process.exit(1);
}
