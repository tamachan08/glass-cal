import { calculateTotal } from './src/logic/calculator';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions, SideConfig, ShapeType } from './src/types';
import * as fs from 'fs';

// Helper to create simple SideConfig
const sc = (enabled: boolean, type: any = 'flat_polish', finish: any = 'migaki'): SideConfig => ({
    enabled, type, finish, chamferWidth: type === 'chamfer' ? '12' : undefined, polishChamferEdge: true
});

const runTests = () => {
    const testCases: { name: string, input: any, expected: number, isExpress?: boolean }[] = [
        {
            name: 'V4.0 Custom Glass: 25000yen, 8mm, 100x100mm',
            input: {
                dimensions: { width: 100, height: 100, thickness: 8 } as GlassDimensions,
                unitPrice: 25000,
                edge: { top: sc(true), bottom: sc(true), left: sc(true), right: sc(true) } as EdgeProcessing,
                shape: 'RECT',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 1, d51_100: 0, d101_plus: 0 },
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
                unitPrice: 2400, // Updated 13.5x
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
            expected: 680 // Material: 0.2 * 2400 = 480. Edge: 200. Total 680.
        },
        {
            name: 'V4.0 Edge Fee Rounding Check (3.5x)',
            input: {
                dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: { top: sc(true), bottom: sc(true), left: sc(true), right: sc(true) } as EdgeProcessing,
                shape: 'CIRCLE',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 2450
        },
        {
            name: 'V4.0 Curved Chamfer Surcharge (Circle + Chamfer)',
            input: {
                dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: {
                    top: sc(true, 'chamfer'), bottom: sc(true, 'chamfer'),
                    left: sc(true, 'chamfer'), right: sc(true, 'chamfer')
                } as EdgeProcessing,
                shape: 'CIRCLE',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 11030
        },
        {
            name: 'V4.0 Itomen Thunder (Curve - Circle)',
            input: {
                dimensions: { width: 300, height: 400, thickness: 5 } as GlassDimensions,
                unitPrice: 0,
                edge: {
                    top: sc(true, 'thunder'), bottom: sc(true, 'thunder'),
                    left: sc(true, 'thunder'), right: sc(true, 'thunder')
                } as EdgeProcessing,
                shape: 'CIRCLE',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions
            },
            expected: 860
        },
        {
            name: 'V4.0 Itomen Thunder (Rect - 10% Material)',
            input: {
                dimensions: { width: 100, height: 100, thickness: 5 } as GlassDimensions,
                unitPrice: 2400, // Updated 13.5x
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
            // Material: 0.2 * 2400 = 480.
            // Edge: 10% = 48.
            // Total: 528 -> 530.
            expected: 530
        },
        {
            name: 'V4.0 Express Delivery (Standard)',
            input: {
                dimensions: { width: 100, height: 100, thickness: 5 } as GlassDimensions,
                unitPrice: 2400, // Updated 13.5x
                edge: { top: sc(true), bottom: sc(false), left: sc(false), right: sc(false) } as EdgeProcessing,
                shape: 'RECT',
                options: {
                    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
                    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
                    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
                    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
                    hikiteCount: 0,
                    complexProcessing: { notch: [], eguri: [], square_hole: [] }
                } as ProcessingOptions,
            },
            isExpress: true,
            // Material: 480.
            // Edge: 50. Express 60.
            // Total: 480 + 60 = 540.
            expected: 540
        }
    ];

    let passed = 0;
    let failed = 0;
    let output = '';
    const log = (msg: string) => { console.log(msg); output += msg + '\n'; };

    log(`\nRunning V4.0 Verification...`);

    testCases.forEach((t) => {
        const shape = t.input.shape || 'RECT';

        const result = calculateTotal(
            t.input.dimensions,
            t.input.edge,
            shape,
            t.input.options,
            t.input.unitPrice,
            t.isExpress || false
        );
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
