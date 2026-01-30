
import { calculateTotal } from './src/logic/calculator';
import { GlassDimensions, EdgeProcessing, ProcessingOptions, ShapeType } from './src/types';
import { FILM_PRICES, FILM_OPTION_PRICES } from './src/constants';

function createOptions(filmType?: any, delivery = false, pickup = false): ProcessingOptions {
    return {
        rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
        cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
        holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
        specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
        hikiteCount: 0,
        miratect: false,
        filmType: filmType,
        filmDelivery: delivery,
        filmPickup: pickup,
        complexProcessing: { notch: [], eguri: [], square_hole: [] }
    };
}

const defaultEdge: EdgeProcessing = {
    top: { enabled: true, type: 'flat_polish', finish: 'migaki' },
    bottom: { enabled: true, type: 'flat_polish', finish: 'migaki' },
    left: { enabled: true, type: 'flat_polish', finish: 'migaki' },
    right: { enabled: true, type: 'flat_polish', finish: 'migaki' }
};

const runTest = (width: number, height: number, thick: 5 | 8, filmType: string | undefined, delivery: boolean, pickup: boolean, expectedTotal: number, description: string) => {
    const dimensions: GlassDimensions = { width, height, thickness: thick as any };
    const options = createOptions(filmType, delivery, pickup);

    // We strictly want to verify the FILM FEE part.
    // However, calculateTotal returns the whole thing.
    // Let's manually calculate the expected base Fee (Glass + Edge) to isolate Film.
    // Glass Cost (FL3 2000, FL5 2400) - Assuming UnitPrice is passed.
    // Edge Fee (FL5: 500/m) -> Perimeter * 500.

    // To simplify, let's just inspect calculateTotal output vs Expected.
    // Or we can assume unitPrice = 0 to ignore glass cost? No, glass cost min 0.2m2 rule.
    // Let's use unitPrice = 0, so glassCost = 0.
    // And disable edges.

    const noEdge: EdgeProcessing = {
        top: { enabled: false, type: 'flat_polish', finish: 'migaki' },
        bottom: { enabled: false, type: 'flat_polish', finish: 'migaki' },
        left: { enabled: false, type: 'flat_polish', finish: 'migaki' },
        right: { enabled: false, type: 'flat_polish', finish: 'migaki' }
    };

    const result = calculateTotal(dimensions, noEdge, 'RECT', options, 0); // UnitPrice 0
    // Result = Edge(0) + Option(Film) + Glass(0). Total = Film Fee. Use ceil logic.

    // Calculate expected film fee manually
    let expectedFilmFee = 0;
    let raw = 0;
    if (filmType) {
        const wM = Math.ceil(width / 100) / 10;
        const hM = Math.ceil(height / 100) / 10;
        const price = (FILM_PRICES as any)[filmType];
        raw += Math.ceil(wM * hM * price);
    }

    if (delivery) raw += FILM_OPTION_PRICES.delivery;
    if (pickup) raw += FILM_OPTION_PRICES.pickup;

    if (raw > 0) {
        expectedFilmFee = Math.ceil(raw / 10) * 10; // Round up to 10
    }

    // Note: calculateTotal returns rounded totalFee.

    // Check filmFee property directly
    const passed = result.filmFee === expectedFilmFee;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${description}`);
    console.log(`  Expected: ${expectedFilmFee}, Got: ${result.filmFee}`);
    if (!passed) process.exit(1);
};

console.log('--- Verifying Film Application Logic ---');


// Case 1: 926x368, Shatterproof (4200)
// 926 -> 1.0m, 368 -> 0.4m. Area 0.4. Cost 0.4 * 4200 = 1680. Rounded 1680.
runTest(926, 368, 5, 'shatterproof', false, false, 1680, '926x368 Shatterproof');

// Case 2: 500x500, Glasstect (20000)
// 0.5 * 0.5 = 0.25. 0.25 * 20000 = 5000.
runTest(500, 500, 5, 'glasstect', false, false, 5000, '500x500 Glasstect');

// Case 3: 1000x1000, TN-200 (8500)
// 1.0 * 1.0 = 1.0. 8500.
runTest(1000, 1000, 5, 'tn200', false, false, 8500, '1000x1000 TN-200');

// Case 4: No film
runTest(500, 500, 5, undefined, false, false, 0, 'No film');

// Case 5: 8mm thickness (Multiplier should NOT apply to film)
// 926x368, Shatterproof. Expected 1680 (Same as 5mm).
runTest(926, 368, 8, 'shatterproof', false, false, 1680, '926x368 8mm (Should ignore multiplier)');

// Case 6: Shatterproof + Delivery (2000)
// Base 1680 + 2000 = 3680.
runTest(926, 368, 5, 'shatterproof', true, false, 3680, '926x368 Shatterproof + Delivery');

// Case 7: Shatterproof + Delivery + Pickup (2000 + 2000)
// Base 1680 + 4000 = 5680.
runTest(926, 368, 5, 'shatterproof', true, true, 5680, '926x368 Shatterproof + Delivery + Pickup');

// Case 8: Delivery Only (No film type selected) - Should be 2000.
// Assuming user can toggle delivery even without film type, but usually they go together.
// My calculator logic allows it.
runTest(500, 500, 5, undefined, true, false, 2000, 'Delivery Only (No Film Type)');

console.log('--- All Tests Passed ---');
