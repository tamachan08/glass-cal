import { calculateTotal } from './src/logic/calculator';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions } from './src/types';
import * as fs from 'fs';

// Test Cases
const runTests = () => {
    const testCases: { name: string, input: any, expected: number }[] = [
        {
            name: 'Test Case 1: Mirror 5mm',
            input: {
                dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { type: 'flat_polish', finish: 'migaki', processedSides: { top: true, bottom: true, left: true, right: true } } as EdgeProcessing,
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
                unitPrice: 0,
                edge: { type: 'flat_polish', finish: 'migaki', processedSides: { top: true, bottom: true, left: true, right: true } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0
                } as ProcessingOptions
            },
            expected: 4800
        },
        {
            name: 'Test Case 3: Chamfer 12mm + Holes',
            input: {
                dimensions: { width: 1000, height: 1000, thickness: 12 } as GlassDimensions,
                unitPrice: 0,
                edge: { type: 'chamfer', chamferWidth: '18', polishChamferEdge: true, finish: 'migaki', processedSides: { top: true, bottom: true, left: true, right: true } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    // Hole Processing: d31-50: 700 * 2 = 1400. Multiplier 1.5 -> 2100.
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 2, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0
                } as ProcessingOptions
            },
            expected: 8100
        },
        {
            name: 'Test Case 4: Sumikiri + 8mm Multiplier',
            input: {
                dimensions: { width: 500, height: 500, thickness: 8 } as GlassDimensions,
                unitPrice: 0,
                edge: { type: 'flat_polish', finish: 'migaki', processedSides: { top: true, bottom: true, left: true, right: true } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 2, c50: 0, c100: 0, c200: 0 }, // C30=360 * 1.5 = 540.
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0
                } as ProcessingOptions
            },
            expected: 2140
        },
        {
            name: 'Test Case 5: 3 Sides + Arazuri',
            input: {
                dimensions: { width: 1000, height: 500, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                // Top=1000, Left=500, Right=500. Total 2.0m.
                edge: { type: 'flat_polish', finish: 'arazuri', processedSides: { top: true, bottom: false, left: true, right: true } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0
                } as ProcessingOptions
            },
            expected: 990
        },
        {
            name: 'Test Case 6: Material Cost',
            input: {
                dimensions: { width: 1000, height: 1000, thickness: 5 } as GlassDimensions,
                unitPrice: 5000,
                edge: { type: 'flat_polish', finish: 'migaki', processedSides: { top: true, bottom: true, left: true, right: true } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0
                } as ProcessingOptions
            },
            expected: 7200
        },
        {
            name: 'Test Case 7: Hikite Processing Tiers',
            input: {
                dimensions: { width: 1500, height: 800, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { type: 'flat_polish', finish: 'migaki', processedSides: { top: true, bottom: true, left: true, right: true } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 2
                } as ProcessingOptions
            },
            expected: 3730
        },
        {
            name: 'Test Case 8: Notch (Kirikaki) Base',
            input: {
                dimensions: { width: 500, height: 500, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { type: 'flat_polish', finish: 'migaki', processedSides: { top: false, bottom: false, left: false, right: false } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [{ totalLength: 200, count: 1 }] }
                } as ProcessingOptions
            },
            expected: 1000
        },
        {
            name: 'Test Case 9: Eguri Increment',
            input: {
                dimensions: { width: 500, height: 500, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { type: 'flat_polish', finish: 'migaki', processedSides: { top: false, bottom: false, left: false, right: false } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { eguri: [{ totalLength: 450, count: 1 }] }
                } as ProcessingOptions
            },
            expected: 2300
        },
        {
            name: 'Test Case 10: Square Hole + 8mm Multiplier',
            input: {
                dimensions: { width: 500, height: 500, thickness: 8 } as GlassDimensions,
                unitPrice: 0,
                edge: { type: 'flat_polish', finish: 'migaki', processedSides: { top: false, bottom: false, left: false, right: false } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { square_hole: [{ totalLength: 400, count: 1 }] }
                } as ProcessingOptions
            },
            expected: 3750
        },
        {
            name: 'Test Case 11: Mixed Complex Processing (Arrays)',
            input: {
                dimensions: { width: 500, height: 500, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { type: 'flat_polish', finish: 'migaki', processedSides: { top: false, bottom: false, left: false, right: false } } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: {
                        notch: [
                            { totalLength: 200, count: 1 }, // 1000
                            { totalLength: 300, count: 1 }  // 1300
                        ],
                        eguri: [{ totalLength: 300, count: 1 }],       // 1500
                        square_hole: [{ totalLength: 400, count: 1 }]  // 2500
                    }
                } as ProcessingOptions
            },
            expected: 6300
        }
    ];

    let passed = 0;
    let failed = 0;
    let output = '';
    const log = (msg: string) => {
        console.log(msg);
        output += msg + '\n';
    };

    log(`\nRunning Verification...`);
    log(`Loaded ${testCases.length} test cases.\n`);

    testCases.forEach((t) => {
        const result = calculateTotal(t.input.dimensions, t.input.edge, t.input.options, t.input.unitPrice);
        const actual = result.totalFee;

        log(`Checking ${t.name}...`);
        if (actual === t.expected) {
            log(`[${t.name}]`);
            log(`  Expected: ${t.expected}`);
            log(`  Actual:   ${actual}`);
            log(`  Result:   PASS`);
            passed++;
        } else {
            log(`[${t.name}]`);
            log(`  Expected: ${t.expected}`);
            log(`  Actual:   ${actual}`);
            log(`  Result:   FAIL`);
            failed++;
        }
        log('-----------------------------------');
    });

    if (failed === 0) {
        log(`\nALL TESTS PASSED`);
    } else {
        log(`\nSOME TESTS FAILED`);
    }

    fs.writeFileSync('verify_result_final.txt', output);

    if (failed === 0) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

runTests();
