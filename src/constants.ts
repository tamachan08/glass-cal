import type { GlassThickness, ChamferWidth } from './types';

// ① 加工単価マスタ（円/ｍ）※外周メートルあたりの単価
// 厚み: 平磨き(糸面)
export const FLAT_POLISH_PRICES: Record<GlassThickness, number> = {
    3: 450,
    5: 550,
    6: 600,
    8: 800,
    10: 1000,
    12: 1200,
};

// ② 面取り特別単価（円/ｍ）
// Note: Specs say "Flat Polish (thread)" prices are per thickness, but Chamfer prices are per width regardless of thickness.
// Format: [ChamferWidth][Polish(true/false)]
export const CHAMFER_PRICES: Record<ChamferWidth, { polished: number; unpolished?: number }> = {
    '12': {
        polished: 900,
        unpolished: 900, // ERROR case in spec, acting as fallback/alert equivalent
    },
    '18': {
        polished: 1500,
        unpolished: 1300,
    },
    '24': {
        polished: 1800,
        unpolished: 1600,
    },
};

// ③ オプション加工単価（円/個所） FL5mm base
export const OPTION_PRICES = {
    rProcessing: {
        r15: 150,
        r30: 200,
        r50: 250,
        r100: 300,
        r200: 600,
        r300: 900,
    },
    cornerCutProcessing: {
        c30: 180,
        c50: 250,
        c100: 300,
        c200: 450,
    },
    holeProcessing: {
        d5_15: 350,
        d16_30: 450,
        d31_50: 700,
        d51_100: 1400,
        d101_plus: 2200,
    },
    specialProcessing: {
        outletSmall: 1300,
        outletLarge: 2500,
        ventilator: 4800,
    },
};

// Coefficient logic: 3,5,6mm = 1.0; 8,10,12mm = 1.5
export const THICKNESS_MULTIPLIERS: Record<GlassThickness, number> = {
    3: 1.0,
    5: 1.0,
    6: 1.0,
    8: 1.5,
    10: 1.5,
    12: 1.5,
};
