import { calculateTotal } from './src/logic/calculator';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions, SideConfig, ShapeType } from './src/types';
import * as fs from 'fs';

// Helper to create simple SideConfig
const sc = (enabled: boolean, type: any = 'flat_polish', finish: any = 'migaki'): SideConfig => ({
    enabled, type, finish, chamferWidth: type === 'chamfer' ? '12' : undefined, polishChamferEdge: true
});

const runTests = () => {
    const testCases: { name: string, input: any, expected: number }[] = [
        {
            name: 'V4.0 Custom Glass: 25000yen, 8mm, 100x100mm',
            input: {
                dimensions: { width: 100, height: 100, thickness: 8 } as GlassDimensions,
                unitPrice: 25000, // Manual Input
                edge: { top: sc(true), bottom: sc(true), left: sc(true), right: sc(true) } as EdgeProcessing,
                shape: 'RECT',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 1, d51_100: 0, d101_plus: 0 }, // d50 x1 (700yen)
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 6370
        },
        {
            name: 'V4.0 Minimum Area (Standard FL5 100x100)',
            input: {
                dimensions: { width: 100, height: 100, thickness: 5 } as GlassDimensions,
                unitPrice: 2900, // FL5 Price
                edge: { top: sc(true), bottom: sc(true), left: sc(true), right: sc(true) } as EdgeProcessing,
                shape: 'RECT',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 780 // Material: 0.2 * 2900 = 580. Edge: 0.4 * 500 = 200. Total 780.
        },
        {
            name: 'V4.0 Edge Fee Rounding Check (3.5x)',
            input: {
                dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { top: sc(true), bottom: sc(true), left: sc(true), right: sc(true) } as EdgeProcessing,
                shape: 'CIRCLE', // 3.5x
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            // Base Edge: 1.4m * 500 = 700.
            // Shape 3.5x: 700 * 3.5 = 2450.
            // Expected Rounding: 2450 -> 2450.
            expected: 2450
        },
        {
            name: 'V4.0 Curved Chamfer Surcharge (Circle + Chamfer)',
            input: {
                dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                // Chamfer 12mm (900 yen/m) on all sides
                edge: {
                    top: sc(true, 'chamfer'), bottom: sc(true, 'chamfer'),
                    left: sc(true, 'chamfer'), right: sc(true, 'chamfer')
                } as EdgeProcessing,
                shape: 'CIRCLE', // Base 3.5x
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            // Logic:
            // Length: 1.4m.
            // Unit Price: 900 (Chamfer)
            // Shape Mult: 3.5 (Circle) * 2.5 (Surcharge) = 8.75
            // NEW Logic in calculator.ts applies shape per side.
            // Check rounding diff.
            // Top(0.3m): ceil(0.3*900*8.75) = ceil(2362.5) = 2363.
            // Left(0.4m): ceil(0.4*900*8.75) = ceil(3150) = 3150.
            // Total: 2363*2 + 3150*2 = 4726 + 6300 = 11026.
            // Rounding: 11026 -> 11030.
            expected: 11030
        },
        {
            name: 'V4.0 Itomen Thunder (Curve - Circle)',
            input: {
                dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                // Thunder on all sides
                edge: {
                    top: sc(true, 'thunder'), bottom: sc(true, 'thunder'),
                    left: sc(true, 'thunder'), right: sc(true, 'thunder')
                } as EdgeProcessing,
                shape: 'CIRCLE', // 3.5x
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            // Logic:
            // Rough Price(5mm): 350.
            // Shape: 3.5x.
            // Perim 1.4m.
            // Formula: (Rough * Perim * Shape) / 2
            // Side Top(0.3m): (0.3 * 350 * 3.5) / 2 = 183.75 -> ceil 184
            // Side Left(0.4m): (0.4 * 350 * 3.5) / 2 = 245.0 -> ceil 245
            // Total: 184*2 + 245*2 = 368 + 490 = 858.
            // Rounding: 858 -> 860.
            expected: 860
        },
        {
            name: 'V4.0 Itomen Thunder (Rect - 10% Material)',
            input: {
                dimensions: { width: 100, height: 100, thickness: 5 } as GlassDimensions,
                unitPrice: 2900,
                // Thunder on all sides
                edge: {
                    top: sc(true, 'thunder'), bottom: sc(true, 'thunder'),
                    left: sc(true, 'thunder'), right: sc(true, 'thunder')
                } as EdgeProcessing,
                shape: 'RECT',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            // Logic:
            // Material Cost: 0.2m2 * 2900 = 580.
            // Target Fee: 10% = 58.
            // Side allocation: Perim 0.4m. Side 0.1m (25%).
            // Side Fee = 58 * 0.25 = 14.5 -> ceil 15.
            // Total Fee = Edge(60) + Material(580) = 640.
            expected: 640
        }
    ];

    let passed = 0;
    let failed = 0;
    let output = '';
    const log = (msg: string) => { console.log(msg); output += msg + '\n'; };

    log(`\nRunning V4.0 Verification...`);

    testCases.forEach((t) => {
        const shape = t.input.shape || 'RECT';
        const result = calculateTotal(t.input.dimensions, t.input.edge, shape, t.input.options, t.input.unitPrice);
        const actual = result.totalFee;

        log(`Checking ${t.name}...`);
        if (actual === t.expected) {
            log(`  Result:   PASS (${actual})`);
            passed++;
        } else {
            log(`  Result:   FAIL (Expected ${t.expected}, Actual ${actual})`);
            log(`    Debug: Material=${result.glassCost}, Edge=${result.edgeFee}, Option=${result.optionFee}`);
            log(`           Shape: ${shape}, Edge Total: ${result.edgeFee}`);
            failed++;
        }
        log('-----------------------------------');
    });

    if (failed === 0) log(`\nALL V4.0 TESTS PASSED`);
    else log(`\nSOME TESTS FAILED`);

    // Write log to file
    fs.writeFileSync('verify_log.txt', output);

    if (failed === 0) process.exit(0);
    else process.exit(1);
}

runTests();
