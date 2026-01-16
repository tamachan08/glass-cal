import { calculateTotal } from './src/logic/calculator';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions, SideConfig, ShapeType } from './src/types';
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
                edge: { top: sc(true), bottom: sc(true), left: sc(true), right: sc(true) } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 770
        },
        {
            name: 'Test Case 13: Mixed Sides (Top/Left: Flat, Bottom: Kamaboko, Right: Disabled)',
            input: {
                dimensions: { width: 1000, height: 500, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: {
                    top: sc(true, 'flat_polish'),
                    bottom: sc(true, 'kamaboko'),
                    left: sc(true, 'flat_polish'),
                    right: sc(false)
                } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 1930
        },
        {
            name: 'Test Case 14: Suriawase (3x)',
            input: {
                dimensions: { width: 1000, height: 1000, thickness: 10 } as GlassDimensions,
                unitPrice: 0,
                edge: { top: sc(true, 'suriawase'), bottom: sc(true, 'suriawase'), left: sc(true, 'suriawase'), right: sc(true, 'suriawase') } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
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
                edge: { top: sc(true, 'kamaboko'), bottom: sc(true, 'kamaboko'), left: sc(true, 'kamaboko'), right: sc(true, 'kamaboko') } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 4400
        },
        {
            name: 'Test Case 16: Rounding Check (Total)',
            input: {
                dimensions: { width: 310, height: 100, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { top: sc(true, 'flat_polish'), bottom: sc(false), left: sc(false), right: sc(false) } as EdgeProcessing,
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 180
        },
        {
            name: 'Test Case 17: Circle (3.5x)',
            input: {
                dimensions: { width: 500, height: 500, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { top: sc(true), bottom: sc(true), left: sc(true), right: sc(true) } as EdgeProcessing,
                shape: 'CIRCLE',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 3850
        },
        {
            name: 'Test Case 18: Octagon (3x)',
            input: {
                dimensions: { width: 1000, height: 1000, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { top: sc(true, 'chamfer'), bottom: sc(true, 'chamfer'), left: sc(true, 'chamfer'), right: sc(true, 'chamfer') } as EdgeProcessing,
                shape: 'OCTAGON',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 10800
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
        const shape = t.input.shape || 'RECT';
        const result = calculateTotal(t.input.dimensions, t.input.edge, shape, t.input.options, t.input.unitPrice);
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
