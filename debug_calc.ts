import { calculateTotal } from './src/logic/calculator';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions } from './src/types';

const input = {
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
};

const result = calculateTotal(input.dimensions, input.edge, input.options, input.unitPrice);

console.log('Total:', result.totalFee);
console.log('OptionFee:', result.optionFee);
console.log('EdgeFee:', result.edgeFee);
console.log('Inputs:', JSON.stringify(input.options.complexProcessing, null, 2));
