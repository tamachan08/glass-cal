
import { calculateOptionFee } from './src/logic/calculator';
import { ProcessingOptions, GlassDimensions } from './src/types';

function createOptions(miratectCount: number): ProcessingOptions {
    return {
        rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
        cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
        holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
        specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
        hikiteCount: 0,
        miratect: miratectCount > 0,
        complexProcessing: { notch: [], eguri: [], square_hole: [] }
    };
}

const runTest = (width: number, height: number, thick: 5 | 8, count: number, expectedPrice: number, description: string) => {
    const dimensions: GlassDimensions = { width, height, thickness: thick as any };
    const options = createOptions(count);
    const fee = calculateOptionFee(dimensions, options);

    const passed = fee === expectedPrice;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${description}`);
    console.log(`  Size: ${width}x${height}, Thick: ${thick}mm, Count: ${count}`);
    console.log(`  Expected: ${expectedPrice}, Got: ${fee}`);
    if (!passed) process.exit(1);
};

console.log('--- Verifying Miratect Option Logic ---');

// Case 1: Max side <= 900, 5mm (multiplier 1.0) -> Unit 100
// 500x500, On => 100
runTest(500, 500, 5, 1, 100, 'Size 500x500 (<=900), 5mm, On -> 100 yen');

// Case 2: Max side = 900, 5mm (multiplier 1.0) -> Unit 100
// 900x500, On => 100
runTest(900, 500, 5, 1, 100, 'Size 900x500 (<=900), 5mm, On -> 100 yen');

// Case 3: Max side > 900, 5mm (multiplier 1.0) -> Unit 200
// 901x500, On => 200
runTest(901, 500, 5, 1, 200, 'Size 901x500 (>900), 5mm, On -> 200 yen');

// Case 4: Max side > 900, 5mm (multiplier 1.0) -> Unit 200
// 500x1200, On => 200
runTest(500, 1200, 5, 1, 200, 'Size 500x1200 (>900), 5mm, On -> 200 yen');

// Case 5: 8mm thickness (Multiplier 1.5)
// 500x500 (Unit 100) * 1.5 = 150
runTest(500, 500, 8, 1, 150, 'Size 500x500 (<=900), 8mm (1.5x) -> 150 yen');

// Case 6: 8mm thickness (Multiplier 1.5)
// 1000x500 (Unit 200) * 1.5 = 300
runTest(1000, 500, 8, 1, 300, 'Size 1000x500 (>900), 8mm (1.5x) -> 300 yen');

console.log('--- All Tests Passed ---');
