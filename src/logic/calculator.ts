import type { GlassDimensions, EdgeProcessing, ProcessingOptions, CalculationResult, ShapeType } from '../types';
import { FLAT_POLISH_PRICES, CHAMFER_PRICES, OPTION_PRICES, THICKNESS_MULTIPLIERS, SHAPE_MULTIPLIERS } from '../constants';

export const calculatePerimeter = (
    widthMm: number,
    heightMm: number,
    edge?: EdgeProcessing
): number => {
    let length = 0;
    // Fallback if edge is undefined (shouldn't happen in app usage but good for safety)
    if (edge) {
        length =
            (edge.top.enabled ? widthMm : 0) +
            (edge.bottom.enabled ? widthMm : 0) +
            (edge.left.enabled ? heightMm : 0) +
            (edge.right.enabled ? heightMm : 0);
    } else {
        length = widthMm * 2 + heightMm * 2;
    }
    return Math.ceil(length / 10) / 100;
};

export const calculateEdgeFee = (
    dimensions: GlassDimensions,
    edge: EdgeProcessing,
    shape: ShapeType
): number => {
    const calcSideFee = (side: keyof EdgeProcessing, lengthMm: number): number => {
        const config = edge[side];
        if (!config.enabled) return 0;

        const lengthMeters = Math.ceil(lengthMm / 10) / 100;
        const finishMultiplier = config.finish === 'arazuri' ? 0.9 : 1.0;

        let unitPrice = 0;

        if (config.type === 'flat_polish') {
            unitPrice = FLAT_POLISH_PRICES[dimensions.thickness];
        } else if (config.type === 'chamfer') {
            if (!config.chamferWidth) return 0;
            const prices = CHAMFER_PRICES[config.chamferWidth];
            unitPrice = config.polishChamferEdge ? prices.polished : (prices.unpolished ?? prices.polished);
        } else if (config.type === 'suriawase') {
            // Suriawase = 3x Flat Polish
            unitPrice = FLAT_POLISH_PRICES[dimensions.thickness] * 3;
        } else if (config.type === 'kamaboko') {
            // Kamaboko = 2x Flat Polish
            unitPrice = FLAT_POLISH_PRICES[dimensions.thickness] * 2;
        }

        return Math.ceil(lengthMeters * unitPrice * finishMultiplier);
    };

    let totalEdgeFee = 0;
    totalEdgeFee += calcSideFee('top', dimensions.width);
    totalEdgeFee += calcSideFee('bottom', dimensions.width);
    totalEdgeFee += calcSideFee('left', dimensions.height);
    totalEdgeFee += calcSideFee('right', dimensions.height);

    // Apply shape multiplier
    let finalMultiplier = SHAPE_MULTIPLIERS[shape] || 1.0;

    // "Further multiply by 2.5x" logic for Curved Chamfer
    const curvedShapes: ShapeType[] = ['CIRCLE', 'ELLIPSE', 'FAN', 'IRREGULAR', 'COMPLEX'];
    // Check if ANY enabled side is chamfer
    const hasChamfer = (
        (edge.top.enabled && edge.top.type === 'chamfer') ||
        (edge.bottom.enabled && edge.bottom.type === 'chamfer') ||
        (edge.left.enabled && edge.left.type === 'chamfer') ||
        (edge.right.enabled && edge.right.type === 'chamfer')
    );

    if (curvedShapes.includes(shape) && hasChamfer) {
        finalMultiplier *= 2.5; // Changed from += 2.5 to *= 2.5 based on user feedback
    }

    // Round up to nearest 10 yen
    return Math.ceil((totalEdgeFee * finalMultiplier) / 10) * 10;
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
    // Now supporting arrays of items
    if (options.complexProcessing) {
        const calcComplexPrice = (type: 'notch' | 'eguri' | 'square_hole', length: number): number => {
            if (length <= 0) return 0;
            if (type === 'notch') {
                return length <= 200 ? 1000 : (1000 + Math.ceil((length - 200) / 100) * 300);
            }
            if (type === 'eguri') {
                return length <= 300 ? 1500 : (1500 + Math.ceil((length - 300) / 100) * 400);
            }
            if (type === 'square_hole') {
                return length <= 400 ? 2500 : (2500 + Math.ceil((length - 400) / 100) * 600);
            }
            return 0;
        };

        // Notch
        if (options.complexProcessing.notch && Array.isArray(options.complexProcessing.notch)) {
            options.complexProcessing.notch.forEach(item => {
                if (item.count > 0 && item.totalLength > 0) {
                    baseRunningTotal += calcComplexPrice('notch', item.totalLength) * item.count;
                }
            });
        }

        // Eguri
        if (options.complexProcessing.eguri && Array.isArray(options.complexProcessing.eguri)) {
            options.complexProcessing.eguri.forEach(item => {
                if (item.count > 0 && item.totalLength > 0) {
                    baseRunningTotal += calcComplexPrice('eguri', item.totalLength) * item.count;
                }
            });
        }

        // Square Hole
        if (options.complexProcessing.square_hole && Array.isArray(options.complexProcessing.square_hole)) {
            options.complexProcessing.square_hole.forEach(item => {
                if (item.count > 0 && item.totalLength > 0) {
                    baseRunningTotal += calcComplexPrice('square_hole', item.totalLength) * item.count;
                }
            });
        }
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
    // Minimum area rule: 0.2m2
    const calcArea = Math.max(area, 0.2);
    const rawCost = calcArea * unitPrice;
    // Round up to nearest 10 yen
    return Math.ceil(rawCost / 10) * 10;
};

export const calculateTotal = (
    dimensions: GlassDimensions,
    edge: EdgeProcessing,
    shape: ShapeType,
    options: ProcessingOptions,
    unitPrice: number
): CalculationResult => {
    const perimeter = calculatePerimeter(dimensions.width, dimensions.height, edge);
    const edgeFee = calculateEdgeFee(dimensions, edge, shape);
    const optionFee = calculateOptionFee(dimensions, options);
    const glassCost = calculateGlassCost(dimensions.width, dimensions.height, unitPrice);

    const total = edgeFee + optionFee + glassCost;
    const roundedTotal = Math.ceil(total / 10) * 10;
    const areaM2 = (dimensions.width * dimensions.height) / 1_000_000;

    return {
        areaM2,
        perimeter,
        edgeFee,
        optionFee,
        glassCost,
        totalFee: roundedTotal,
    };
};
