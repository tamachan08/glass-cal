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
            expected: 800 // Material: 0.2 * 2900 = 580. Edge: 0.4 * 550 = 220. Total 800.
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
            failed++;
        }
        log('-----------------------------------');
    });

    if (failed === 0) log(`\nALL V4.0 TESTS PASSED`);
    else log(`\nSOME TESTS FAILED`);

    if (failed === 0) process.exit(0);
    else process.exit(1);
}

runTests();
