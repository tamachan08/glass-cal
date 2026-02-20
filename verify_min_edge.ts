
import { calculateEdgeFee } from './src/logic/calculator';
import { GlassDimensions, EdgeProcessing } from './src/types';
import { FLAT_POLISH_PRICES } from './src/constants';

console.log('--- Verifying Minimum Edge Length (250mm) ---');

// Case 1: 100x100mm, FL5, All sides Flat Polish Migaki
// Width = 100mm. Min applies -> 250mm = 0.25m.
// Height = 100mm. Min applies -> 250mm = 0.25m.
// Total Perimeter calc (internal to function):
// Top: 0.25 * 500 = 125 -> ceil(12.5)*10 = 130 ?? No, ceil(0.25 * 500) = 125.
// Let's check calculator logic rounding:
// Math.ceil(lengthMeters * unitPrice * finishMultiplier * sMult)
// 0.25 * 500 * 1.0 * 1.0 = 125.
// Total = 125*4 = 500.
// Final Total -> ceil(500/10)*10 = 500.

// Without fix:
// 100mm -> 0.1m.
// 0.1 * 500 = 50.
// Total = 50*4 = 200.

const dim: GlassDimensions = { width: 100, height: 100, thickness: 5 };
const edge: EdgeProcessing = {
    top: { enabled: true, type: 'flat_polish', finish: 'migaki' },
    bottom: { enabled: true, type: 'flat_polish', finish: 'migaki' },
    left: { enabled: true, type: 'flat_polish', finish: 'migaki' },
    right: { enabled: true, type: 'flat_polish', finish: 'migaki' }
};

const fee = calculateEdgeFee(dim, edge, 'RECT', 0);
console.log(`100x100 FL5 FlatPolish`);
console.log(`Expected (with min 250mm): 500`);
console.log(`Actual: ${fee}`);

if (fee === 500) {
    console.log('[PASS] Minimum edge length check');
} else {
    console.error(`[FAIL] Expected 500, got ${fee}`);
    process.exit(1);
}

// Case 2: 300x100mm. 
// Top/Bottom: 300mm (>250). 0.3m * 500 = 150.
// Left/Right: 100mm (<250) -> 250mm. 0.25m * 500 = 125.
// Total = 150*2 + 125*2 = 300 + 250 = 550.

const dim2: GlassDimensions = { width: 300, height: 100, thickness: 5 };
const fee2 = calculateEdgeFee(dim2, edge, 'RECT', 0);
console.log(`\n300x100 FL5 FlatPolish`);
console.log(`Expected: 550`);
console.log(`Actual: ${fee2}`);

if (fee2 === 550) {
    console.log('[PASS] Mixed edge length check');
} else {
    console.error(`[FAIL] Expected 550, got ${fee2}`);
    process.exit(1);
}
