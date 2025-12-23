import { calculateTotal } from './src/logic/calculator';
import { GlassDimensions, EdgeProcessing, ProcessingOptions } from './src/types';

const testCases = [
    {
        name: 'Test Case 1: Mirror 5mm',
        input: {
            dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
            edge: {
                type: 'flat_polish',
                finish: 'migaki',
                processedSides: { top: true, bottom: true, left: true, right: true }
            } as EdgeProcessing,
            options: {
                rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                hikiteCount: 0
            } as ProcessingOptions
        },
        expected: 770
    },
    {
        name: 'Test Case 2: Heavy 8mm',
        input: {
            dimensions: { width: 1000, height: 2000, thickness: 8 } as GlassDimensions,
            edge: {
                type: 'flat_polish',
                finish: 'migaki',
                processedSides: { top: true, bottom: true, left: true, right: true }
            } as EdgeProcessing,
            options: {
                rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 }
            } as ProcessingOptions
        },
        expected: 4800
    },
    {
        name: 'Test Case 3: Chamfer 12mm + Holes',
        input: {
            dimensions: { width: 1000, height: 1000, thickness: 12 } as GlassDimensions,
            edge: {
                type: 'chamfer',
                chamferWidth: '18',
                polishChamferEdge: true,
                finish: 'migaki',
                processedSides: { top: true, bottom: true, left: true, right: true }
            } as EdgeProcessing,
            options: {
                rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 2, d51_100: 0, d101_plus: 0 }, // φ50 is d31_50
                cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 }
            } as ProcessingOptions
        },
        expected: 8100
    },
    {
        name: 'Test Case 4: Sumikiri + 8mm Multiplier',
        input: {
            dimensions: { width: 500, height: 500, thickness: 8 } as GlassDimensions,
            edge: {
                type: 'flat_polish',
                finish: 'migaki',
                processedSides: { top: true, bottom: true, left: true, right: true }
            } as EdgeProcessing,
            options: {
                rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                cornerCutProcessing: { c30: 2, c50: 0, c100: 0, c200: 0 }, // 180 * 2 = 360
                specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                hikiteCount: 0
            } as ProcessingOptions
        },
        // Edge Fee: 2.0m * 800 = 1600
        // Option Fee: (180 * 2) * 1.5 = 360 * 1.5 = 540
        // Total: 2140
        expected: 2140
    },
    {
        name: 'Test Case 5: 3 Sides + Arazuri',
        input: {
            dimensions: { width: 1000, height: 1000, thickness: 5 } as GlassDimensions,
            edge: {
                type: 'flat_polish',
                finish: 'arazuri',
                processedSides: { top: true, bottom: true, left: true, right: false }
            } as EdgeProcessing,
            options: {
                rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 }
            } as ProcessingOptions
        },
        // Perimeter: 1.0 (Top) + 1.0 (Bottom) + 1.0 (Left) = 3.0m
        // Price: 550 yen/m * 3.0m = 1650
        // Arazuri Discount: 1650 * 0.9 = 1485
        expected: 1485
    },
    {
        name: 'Test Case 6: Material Cost',
        input: {
            dimensions: { width: 1000, height: 1000, thickness: 5 } as GlassDimensions,
            unitPrice: 5000, // 5000 yen/m2
            edge: {
                type: 'flat_polish',
                finish: 'migaki',
                processedSides: { top: true, bottom: true, left: true, right: true }
            } as EdgeProcessing,
            options: {
                rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 }
            } as ProcessingOptions
        },
        // Area: 1.0 * 1.0 = 1.0 m2
        // Material: 1.0 * 5000 = 5000
        // Processing: 4.0m * 550 = 2200
        // Total: 7200
        expected: 7200
    },
    {
        name: 'Test Case 7: Hikite Processing Tiers',
        input: {
            dimensions: { width: 1000, height: 1801, thickness: 5 } as GlassDimensions,
            unitPrice: 0,
            edge: {
                type: 'flat_polish',
                finish: 'migaki',
                processedSides: { top: false, bottom: false, left: false, right: false }
            } as EdgeProcessing,
            options: {
                rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                hikiteCount: 2
            } as ProcessingOptions
        },
        // Perimeter: 0 (No sides)
        // Edge Fee: 0
        // Option Fee needs 1.5x multiplier for 8mm? No, logic uses thickness. Here it is 5mm. Multiplier 1.0.
        // Long side: 1801mm -> Price 1000 yen.
        // Fee: 2 * 1000 = 2000 yen.
        // Total: 2000 yen.
        expected: 2000
    }
];

console.log('Running Verification...\n');
console.log(`Loaded ${testCases.length} test cases.`);

let allPassed = true;

try {
    testCases.forEach(tc => {
        try {
            console.log(`Checking ${tc.name}...`);
            // @ts-ignore
            const price = tc.input.unitPrice ?? 0;
            const result = calculateTotal(tc.input.dimensions, tc.input.edge, tc.input.options, price);
            const passed = result.totalFee === tc.expected;

            console.log(`[${tc.name}]`);
            console.log(`  Expected: ${tc.expected}`);
            console.log(`  Actual:   ${result.totalFee}`);
            console.log(`  Perimeter: ${result.perimeter}m`);
            console.log(`  EdgeFee:   ${result.edgeFee}`);
            console.log(`  OptionFee: ${result.optionFee}`);
            console.log(`  GlassCost: ${result.glassCost}`);
            console.log(`  Result:   ${passed ? 'PASS' : 'FAIL'}`);
            console.log('-----------------------------------');

            if (!passed) allPassed = false;
        } catch (e) {
            console.error(`Error in ${tc.name}:`, e);
            allPassed = false;
        }
    });
} catch (err) {
    console.error("Top level error:", err);
    allPassed = false;
}

if (allPassed) {
    console.log('ALL TESTS PASSED');
    process.exit(0);
} else {
    console.error('SOME TESTS FAILED');
    process.exit(1);
}
