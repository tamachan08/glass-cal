import type { GlassDimensions, EdgeProcessing, ProcessingOptions, CalculationResult, ShapeType } from '../types';
import { FLAT_POLISH_PRICES, CHAMFER_PRICES, OPTION_PRICES, THICKNESS_MULTIPLIERS, SHAPE_MULTIPLIERS, ROUGH_PRICES, FILM_PRICES, FILM_OPTION_PRICES } from '../constants';

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

export const calculateGlassCost = (
    widthMm: number,
    heightMm: number,
    unitPrice: number
): number => {
    // Area in square meters
    const area = (widthMm * heightMm) / 1_000_000;
    // Minimum area rule: 0.1m2
    const calcArea = Math.max(area, 0.1);
    const rawCost = calcArea * unitPrice;
    // Round up to nearest 10 yen
    return Math.ceil(rawCost / 10) * 10;
};

export const calculateEdgeFee = (
    dimensions: GlassDimensions,
    edge: EdgeProcessing,
    shape: ShapeType,
    unitPrice: number = 0,
    isExpress: boolean = false
): number => {
    const totalPerimMm = dimensions.width * 2 + dimensions.height * 2;
    // Calculate raw material cost for Case B usage
    // Note: The prompt says "Material Cost * 0.1". 
    // Usually uses the standard material calculation (min 0.2m2).
    const materialCost = calculateGlassCost(dimensions.width, dimensions.height, unitPrice);

    const curvedShapes: ShapeType[] = ['TENMARU_1', 'TENMARU_2', 'CIRCLE', 'ELLIPSE', 'FAN', 'IRREGULAR', 'COMPLEX'];

    const calcSideFee = (side: keyof EdgeProcessing, lengthMm: number): number => {
        const config = edge[side];
        if (!config.enabled) return 0;

        // Apply Minimum Edge Length of 250mm
        const effectiveLengthMm = Math.max(lengthMm, 250);
        const lengthMeters = Math.ceil(effectiveLengthMm / 10) / 100;
        const finishMultiplier = config.finish === 'arazuri' ? 0.9 : 1.0;

        // Shape Multiplier for this specific edge calc
        let shapeMult = SHAPE_MULTIPLIERS[shape] || 1.0;

        if (config.type === 'thunder') {
            // Thunder Logic
            if (curvedShapes.includes(shape)) {
                // Case A: Curved/Irregular -> (Rough Grind * Perimeter * Shape) / 2
                const roughPrice = ROUGH_PRICES[dimensions.thickness] || 350; // default 350 if missing
                // Logic: (Unit * Length * Shape) / 2
                const fee = (lengthMeters * roughPrice * shapeMult) / 2;
                return Math.ceil(fee);
            } else {
                // Case B: Rect/Normal -> Material Cost * 10% (Proportional to side)
                // Fee = (MaterialCost * 0.1) * (Processed Length / Total Perimeter)
                // Use actual lengthMm for proportion
                const proportion = lengthMm / totalPerimMm;
                const fee = (materialCost * 0.1) * proportion;
                return Math.ceil(fee);
            }
        }

        let unitPriceVal = 0;

        if (config.type === 'flat_polish') {
            unitPriceVal = FLAT_POLISH_PRICES[dimensions.thickness];
        } else if (config.type === 'chamfer') {
            if (!config.chamferWidth) return 0;
            const prices = CHAMFER_PRICES[config.chamferWidth];
            unitPriceVal = config.polishChamferEdge ? prices.polished : (prices.unpolished ?? prices.polished);
        } else if (config.type === 'suriawase') {
            // Suriawase = 3x Flat Polish
            unitPriceVal = FLAT_POLISH_PRICES[dimensions.thickness] * 3;
        } else if (config.type === 'kamaboko') {
            // Kamaboko = 2x Flat Polish
            unitPriceVal = FLAT_POLISH_PRICES[dimensions.thickness] * 2;
        }

        let sMult = SHAPE_MULTIPLIERS[shape] || 1.0;

        // Curved Chamfer Surcharge
        if (curvedShapes.includes(shape) && config.type === 'chamfer') {
            sMult *= 2.5;
        }

        return Math.ceil(lengthMeters * unitPriceVal * finishMultiplier * sMult);
    };

    const calculateStandardSide = (side: keyof EdgeProcessing, lengthMm: number): number => {
        const config = edge[side];
        if (!config.enabled) return 0;

        if (config.type === 'thunder') {
            // Use logic above
            return calcSideFee(side, lengthMm);
        }

        // Apply Minimum Edge Length of 250mm
        const effectiveLengthMm = Math.max(lengthMm, 250);
        const lengthMeters = Math.ceil(effectiveLengthMm / 10) / 100;
        const finishMultiplier = config.finish === 'arazuri' ? 0.9 : 1.0;

        let uPrice = 0;
        if (config.type === 'flat_polish') {
            uPrice = FLAT_POLISH_PRICES[dimensions.thickness];
        } else if (config.type === 'chamfer') {
            if (!config.chamferWidth) return 0;
            const prices = CHAMFER_PRICES[config.chamferWidth];
            uPrice = config.polishChamferEdge ? prices.polished : (prices.unpolished ?? prices.polished);
        } else if (config.type === 'suriawase') {
            uPrice = FLAT_POLISH_PRICES[dimensions.thickness] * 3;
        } else if (config.type === 'kamaboko') {
            uPrice = FLAT_POLISH_PRICES[dimensions.thickness] * 2;
        }

        let sMult = SHAPE_MULTIPLIERS[shape] || 1.0;

        // Curved Chamfer Surcharge
        if (curvedShapes.includes(shape) && config.type === 'chamfer') {
            sMult *= 2.5;
        }

        return Math.ceil(lengthMeters * uPrice * finishMultiplier * sMult);
    };

    // Refactored main loop
    let totalEdgeFee = 0;
    totalEdgeFee += calculateStandardSide('top', dimensions.width);
    totalEdgeFee += calculateStandardSide('bottom', dimensions.width);
    totalEdgeFee += calculateStandardSide('left', dimensions.height);
    totalEdgeFee += calculateStandardSide('right', dimensions.height);

    // Apply Express Surcharge (1.2x)
    if (isExpress) {
        totalEdgeFee *= 1.2;
    }

    // Round up total to nearest 10 yen
    return Math.ceil(totalEdgeFee / 10) * 10;
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
    baseRunningTotal += (options.specialProcessing.hinge || 0) * (OPTION_PRICES.specialProcessing.hinge || 750);
    baseRunningTotal += (options.specialProcessing.keyHole || 0) * (OPTION_PRICES.specialProcessing.keyHole || 500);

    // Miratect: 100yen if max side <= 900, 200yen if > 900
    if (options.miratect) {
        const maxSide = Math.max(dimensions.width, dimensions.height);
        const miratectPrice = maxSide <= 900 ? 100 : 200;
        baseRunningTotal += miratectPrice;
    }


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

    // Complex Processing
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

        if (options.complexProcessing.notch && Array.isArray(options.complexProcessing.notch)) {
            options.complexProcessing.notch.forEach(item => {
                if (item.count > 0 && item.totalLength > 0) {
                    baseRunningTotal += calcComplexPrice('notch', item.totalLength) * item.count;
                }
            });
        }
        if (options.complexProcessing.eguri && Array.isArray(options.complexProcessing.eguri)) {
            options.complexProcessing.eguri.forEach(item => {
                if (item.count > 0 && item.totalLength > 0) {
                    baseRunningTotal += calcComplexPrice('eguri', item.totalLength) * item.count;
                }
            });
        }
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

export const calculateTotal = (
    dimensions: GlassDimensions,
    edge: EdgeProcessing,
    shape: ShapeType,
    options: ProcessingOptions,
    unitPrice: number,
    isExpress: boolean = false
): CalculationResult => {
    const perimeter = calculatePerimeter(dimensions.width, dimensions.height, edge);
    const edgeFee = calculateEdgeFee(dimensions, edge, shape, unitPrice, isExpress);
    const optionFee = calculateOptionFee(dimensions, options);

    // Film Fee Calculation (Separate and rounded to nearest 10)
    let filmFee = 0;
    // Check if any film option is active (User might select Delivery only? Assuming yes based on request)
    // But usually delivery implies film. However, I'll calculate them if the options are true.
    let rawFilmFee = 0;

    if (options.filmType) {
        const widthM = Math.ceil(dimensions.width / 100) / 10;
        const heightM = Math.ceil(dimensions.height / 100) / 10;
        const unitPriceFilm = FILM_PRICES[options.filmType] || 0;
        rawFilmFee += Math.ceil(widthM * heightM * unitPriceFilm);
    }

    if (options.filmDelivery) {
        rawFilmFee += FILM_OPTION_PRICES.delivery;
    }

    if (options.filmPickup) {
        rawFilmFee += FILM_OPTION_PRICES.pickup;
    }

    if (rawFilmFee > 0) {
        filmFee = Math.ceil(rawFilmFee / 10) * 10; // Round up to nearest 10
    }

    const glassCost = calculateGlassCost(dimensions.width, dimensions.height, unitPrice);

    const total = edgeFee + optionFee + filmFee + glassCost;
    const roundedTotal = Math.ceil(total / 10) * 10;
    const areaM2 = (dimensions.width * dimensions.height) / 1_000_000;

    return {
        areaM2,
        perimeter,
        edgeFee,
        optionFee,
        filmFee,
        glassCost,
        totalFee: roundedTotal,
    };
};
