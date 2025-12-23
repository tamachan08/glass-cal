import type { GlassDimensions, EdgeProcessing, ProcessingOptions, CalculationResult } from '../types';
import { FLAT_POLISH_PRICES, CHAMFER_PRICES, OPTION_PRICES, THICKNESS_MULTIPLIERS } from '../constants';

export const calculatePerimeter = (
    widthMm: number,
    heightMm: number,
    processedSides?: { top: boolean; bottom: boolean; left: boolean; right: boolean }
): number => {
    let length = 0;
    if (processedSides) {
        length =
            (processedSides.top ? widthMm : 0) +
            (processedSides.bottom ? widthMm : 0) +
            (processedSides.left ? heightMm : 0) +
            (processedSides.right ? heightMm : 0);
    } else {
        length = widthMm * 2 + heightMm * 2;
    }
    return Math.ceil(length / 10) / 100;
};

export const calculateEdgeFee = (
    dimensions: GlassDimensions,
    edge: EdgeProcessing,
    perimeterMeters: number
): number => {
    // Finish Multiplier
    const finishMultiplier = edge.finish === 'arazuri' ? 0.9 : 1.0;

    if (edge.type === 'flat_polish') {
        const pricePerMeter = FLAT_POLISH_PRICES[dimensions.thickness];
        return Math.ceil(perimeterMeters * pricePerMeter * finishMultiplier);
    } else if (edge.type === 'chamfer') {
        if (!edge.chamferWidth) {
            return 0;
        }
        const prices = CHAMFER_PRICES[edge.chamferWidth];
        const unitPrice = edge.polishChamferEdge ? prices.polished : (prices.unpolished ?? prices.polished);
        return Math.ceil(perimeterMeters * unitPrice * finishMultiplier);
    }
    return 0;
};

export const calculateOptionFee = (
    dimensions: GlassDimensions,
    options: ProcessingOptions
): number => {
    const multiplier = THICKNESS_MULTIPLIERS[dimensions.thickness];
    let baseRunningTotal = 0;

    // R Processing
    baseRunningTotal += options.rProcessing.r15 * OPTION_PRICES.rProcessing.r15;
    baseRunningTotal += options.rProcessing.r30 * OPTION_PRICES.rProcessing.r30;
    baseRunningTotal += options.rProcessing.r50 * OPTION_PRICES.rProcessing.r50;
    baseRunningTotal += options.rProcessing.r100 * OPTION_PRICES.rProcessing.r100;
    baseRunningTotal += options.rProcessing.r200 * OPTION_PRICES.rProcessing.r200;
    baseRunningTotal += options.rProcessing.r300 * OPTION_PRICES.rProcessing.r300;

    // Sumikiri (Corner Cut) Processing
    baseRunningTotal += (options.cornerCutProcessing?.c30 ?? 0) * OPTION_PRICES.cornerCutProcessing.c30;
    baseRunningTotal += (options.cornerCutProcessing?.c50 ?? 0) * OPTION_PRICES.cornerCutProcessing.c50;
    baseRunningTotal += (options.cornerCutProcessing?.c100 ?? 0) * OPTION_PRICES.cornerCutProcessing.c100;
    baseRunningTotal += (options.cornerCutProcessing?.c200 ?? 0) * OPTION_PRICES.cornerCutProcessing.c200;

    // Hole Processing
    baseRunningTotal += options.holeProcessing.d5_15 * OPTION_PRICES.holeProcessing.d5_15;
    baseRunningTotal += options.holeProcessing.d16_30 * OPTION_PRICES.holeProcessing.d16_30;
    baseRunningTotal += options.holeProcessing.d31_50 * OPTION_PRICES.holeProcessing.d31_50;
    baseRunningTotal += options.holeProcessing.d51_100 * OPTION_PRICES.holeProcessing.d51_100;
    baseRunningTotal += options.holeProcessing.d101_plus * OPTION_PRICES.holeProcessing.d101_plus;

    // Special Processing
    baseRunningTotal += options.specialProcessing.outletSmall * OPTION_PRICES.specialProcessing.outletSmall;
    baseRunningTotal += options.specialProcessing.outletLarge * OPTION_PRICES.specialProcessing.outletLarge;
    baseRunningTotal += options.specialProcessing.ventilator * OPTION_PRICES.specialProcessing.ventilator;

    // Hikite Processing (Finger Pull)
    // Pricing based on long side dimension
    // ~1200mm: 400 JPY
    // ~1800mm: 600 JPY
    // 1801mm+: 1000 JPY
    if (options.hikiteCount > 0) {
        const longSide = Math.max(dimensions.width, dimensions.height);
        let hikiteUnitPrice = 0;

        if (longSide <= 1200) {
            hikiteUnitPrice = 400;
        } else if (longSide <= 1800) {
            hikiteUnitPrice = 600;
        } else {
            hikiteUnitPrice = 1000;
        }

        baseRunningTotal += options.hikiteCount * hikiteUnitPrice;
    }

    // Complex Processing (Notch/Eguri/Square Hole)
    if (options.complexProcessing && options.complexProcessing.count > 0 && options.complexProcessing.totalLength > 0) {
        const { type, totalLength, count } = options.complexProcessing;
        let unitPrice = 0;

        if (type === 'notch') { // 切り欠き
            // Base: 1000 yen <= 200mm
            // Add: 300 yen per 100mm over 200mm
            if (totalLength <= 200) {
                unitPrice = 1000;
            } else {
                unitPrice = 1000 + Math.ceil((totalLength - 200) / 100) * 300;
            }
        } else if (type === 'eguri') { // エグリ
            // Base: 1500 yen <= 300mm
            // Add: 400 yen per 100mm over 300mm
            if (totalLength <= 300) {
                unitPrice = 1500;
            } else {
                unitPrice = 1500 + Math.ceil((totalLength - 300) / 100) * 400;
            }
        } else if (type === 'square_hole') { // 角穴
            // Base: 2500 yen <= 400mm
            // Add: 600 yen per 100mm over 400mm
            if (totalLength <= 400) {
                unitPrice = 2500;
            } else {
                unitPrice = 2500 + Math.ceil((totalLength - 400) / 100) * 600;
            }
        }

        // This is subject to thickness multiplier (same as other options)
        baseRunningTotal += unitPrice * count;
    }

    return Math.ceil(baseRunningTotal * multiplier);
};

export const calculateGlassCost = (
    widthMm: number,
    heightMm: number,
    unitPrice: number
): number => {
    // Area in square meters
    const area = (widthMm * heightMm) / 1_000_000;
    const rawCost = area * unitPrice;
    // Round up to nearest 10 yen
    return Math.ceil(rawCost / 10) * 10;
};

export const calculateTotal = (
    dimensions: GlassDimensions,
    edge: EdgeProcessing,
    options: ProcessingOptions,
    unitPrice: number
): CalculationResult => {
    const perimeter = calculatePerimeter(dimensions.width, dimensions.height, edge.processedSides);
    const edgeFee = calculateEdgeFee(dimensions, edge, perimeter);
    const optionFee = calculateOptionFee(dimensions, options);
    const glassCost = calculateGlassCost(dimensions.width, dimensions.height, unitPrice);

    return {
        perimeter,
        edgeFee,
        optionFee,
        glassCost,
        totalFee: edgeFee + optionFee + glassCost,
    };
};
