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
    '25_plus': {
        polished: 2700,
        unpolished: 2700,
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

export const SHAPE_MULTIPLIERS: Record<import('./types').ShapeType, number> = {
    'RECT': 1.0,
    'CORNER_1': 1.5,
    'CORNER_2': 2.0,
    'TENMARU_1': 2.0,
    'HEXAGON': 2.0,
    'TENMARU_2': 3.0,
    'OCTAGON': 3.0,
    'CIRCLE': 4.0,
    'ELLIPSE': 5.0,
    'FAN': 5.0,
    'IRREGULAR': 8.0,
    'COMPLEX': 10.0
};

export const SHAPE_LABELS: Record<import('./types').ShapeType, string> = {
    'RECT': '四角形 (1倍)',
    'CORNER_1': 'トメ切り（1ヶ所） (1.5倍)',
    'CORNER_2': 'トメ切り（2ヶ所） (2倍)',
    'TENMARU_1': '片天丸 (2倍)',
    'HEXAGON': '六角形 (2倍)',
    'TENMARU_2': '両天丸 (3倍)',
    'OCTAGON': '八角形 (3倍)',
    'CIRCLE': '円形（丸） (4倍)',
    'ELLIPSE': '楕円 (5倍)',
    'FAN': '扇形 (5倍)',
    'IRREGULAR': '異形 (8倍)',
    'COMPLEX': '複雑異形 (10倍)'
};
