import { calculateTotal } from './src/logic/calculator';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions, SideConfig } from './src/types';
import * as fs from 'fs';

const sc = (enabled: boolean): SideConfig => ({
    enabled, type: 'flat_polish', finish: 'migaki', polishChamferEdge: true
});

const runTests = () => {
    const testCases = [
        {
            name: 'Case 1: 5mm Glass (Standard) - 1 Hinge, 1 Keyhole',
            input: {
                dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
                unitPrice: 2400,
                edge: { top: sc(true), bottom: sc(true), left: sc(true), right: sc(true) } as EdgeProcessing,
                shape: 'RECT',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 1, keyHole: 1 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            // Option Fee:
            // Hinge: 750
            // Keyhole: 500
            // Total Option: 1250
            // Multiplier for 5mm: 1.0
            // Final Option: 1250
            expectedOptionFee: 1250
        },
        {
            name: 'Case 2: 8mm Glass (Thick) - 2 Hinges',
            input: {
                dimensions: { width: 300, height: 400, thickness: 8 } as GlassDimensions,
                unitPrice: 4300,
                edge: { top: sc(true), bottom: sc(true), left: sc(true), right: sc(true) } as EdgeProcessing,
                shape: 'RECT',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 2, keyHole: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            // Option Fee:
            // Hinge: 750 * 2 = 1500
            // Multiplier for 8mm: 1.5
            // Final Option: 1500 * 1.5 = 2250
            expectedOptionFee: 2250
        }
    ];

    let passed = 0;
    let failed = 0;
    let output = '';
    const log = (msg: string) => { console.log(msg); output += msg + '\n'; };

    log('\nRunning Hinge & Keyhole Verification...');

    testCases.forEach((t) => {
        const result = calculateTotal(
            t.input.dimensions,
            t.input.edge,
            'RECT',
            t.input.options,
            t.input.unitPrice
        );

        const actual = result.optionFee;
        log(`checking ${t.name}...`);
        if (actual === t.expectedOptionFee) {
            log(`  PASS: Expected ${t.expectedOptionFee}, Got ${actual}`);
            passed++;
        } else {
            log(`  FAIL: Expected ${t.expectedOptionFee}, Got ${actual}`);
            failed++;
        }
    });

    if (failed === 0) log('\nALL TESTS PASSED');
    else log('\nSOME TESTS FAILED');

    fs.writeFileSync('verify_hinge_result.txt', output);
}

runTests();
