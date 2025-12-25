import { calculateTotal } from './src/logic/calculator';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions, SideConfig } from './src/types';
import * as fs from 'fs';

// Helper to create simple SideConfig
const sc = (enabled: boolean, type: any = 'flat_polish', finish: any = 'migaki'): SideConfig => ({
    enabled, type, finish, chamferWidth: type === 'chamfer' ? '12' : undefined, polishChamferEdge: true
});

// Test Cases
const runTests = () => {
    const testCases: { name: string, input: any, expected: number }[] = [
        {
            name: 'Test Case 1: Mirror 5mm (All Flat Polish)',
            input: {
                dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: {
                    top: sc(true), bottom: sc(true), left: sc(true), right: sc(true)
                } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            // Perimeter 1.4m. Price 550. Total 770.
            expected: 770
        },
        {
            name: 'Test Case 13: Mixed Sides (Top/Left: Flat, Bottom: Kamaboko, Right: Disabled)',
            input: {
                dimensions: { width: 1000, height: 500, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: {
                    top: sc(true, 'flat_polish'),     // 1.0m. 550.
                    bottom: sc(true, 'kamaboko'),     // 1.0m. 550*2=1100.
                    left: sc(true, 'flat_polish'),    // 0.5m. 550*0.5=275 -> ceil(0.5*550)=275. Wait logic is meters. ceil(0.5*550)? No, ceil(0.5 * 550).
                    // Logic: ceil(lengthMeters * UnitPrice).
                    // Top: 1.0 * 550 = 550.
                    // Bottom: 1.0 * 1100 = 1100.
                    // Left: 0.5 * 550 = 275.
                    right: sc(false)                  // 0.
                } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            // Total: 550 + 1100 + 275 = 1925. -> Rounded to 1930.
            expected: 1930
        },
        {
            name: 'Test Case 14: Suriawase (3x)',
            input: {
                dimensions: { width: 1000, height: 1000, thickness: 10 } as GlassDimensions,
                unitPrice: 0,
                // Thickness 10mm -> Flat Polish Price 1000.
                // Suriawase Price -> 3000.
                // All sides. 4.0m.
                // Total: 4.0 * 3000 = 12000.
                edge: {
                    top: sc(true, 'suriawase'),
                    bottom: sc(true, 'suriawase'),
                    left: sc(true, 'suriawase'),
                    right: sc(true, 'suriawase')
                } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 12000
        },
        {
            name: 'Test Case 15: Kamaboko Price (2x)',
            input: {
                dimensions: { width: 1000, height: 1000, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                // Kamaboko = 550 * 2 = 1100.
                // 4.0m * 1100 = 4400.
                edge: {
                    top: sc(true, 'kamaboko'),
                    bottom: sc(true, 'kamaboko'),
                    left: sc(true, 'kamaboko'),
                    right: sc(true, 'kamaboko')
                } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 4400
        },
        {
            name: 'Test Case 16: Rounding Check (Total)',
            input: {
                // Width 310mm -> 0.31m. Flat Polish 5mm (550).
                // Side Fee: 0.31 * 550 = 170.5 -> ceil(171).
                // If we enable just TOP side: 171 yen.
                // Updated Total Logic: ceil(171 / 10) * 10 = 180.
                dimensions: { width: 310, height: 100, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: {
                    top: sc(true, 'flat_polish'),
                    bottom: sc(false),
                    left: sc(false),
                    right: sc(false)
                } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 180
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
