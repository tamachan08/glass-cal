import type { GlassThickness, ChamferWidth } from './types';

// V4.0 Material DB
export const MATERIAL_DB: Record<string, { price: number; thick: GlassThickness; label: string }> = {
    // 透明フロート
    "FL3": { price: 2400, thick: 3, label: '透明フロート 3mm (FL3)' },
    "FL5": { price: 2900, thick: 5, label: '透明フロート 5mm (FL5)' },
    "FL6": { price: 3500, thick: 6, label: '透明フロート 6mm (FL6)' },
    "FL8": { price: 5200, thick: 8, label: '透明フロート 8mm (FL8)' },
    "FL10": { price: 6800, thick: 10, label: '透明フロート 10mm (FL10)' },
    "FL12": { price: 18500, thick: 12, label: '透明フロート 12mm (FL12)' },
    // ミラー
    "M3": { price: 2800, thick: 3, label: 'ミラー 3mm (M3)' },
    "CM5": { price: 4000, thick: 5, label: 'クリアミラー 5mm (CM5)' },
    "M6": { price: 9600, thick: 6, label: 'ミラー 6mm (M6)' },
    "JM5": { price: 5600, thick: 5, label: '国産ミラー 5mm (JM5)' },
    "EPM5": { price: 8000, thick: 5, label: '防湿ミラー 5mm (EPM5)' },
    "MS5": { price: 21600, thick: 5, label: '高透過ミラー 5mm (MS5)' },
    // カラーミラー
    "BM5": { price: 8800, thick: 5, label: 'ブロンズミラー 5mm (BM5)' },
    "GM5": { price: 8800, thick: 5, label: 'グレーミラー 5mm (GM5)' },
    "NBM5": { price: 19200, thick: 5, label: 'ニューブラックミラー 5mm (NBM5)' },
    "SBM5": { price: 16000, thick: 5, label: 'セピアブラウンミラー 5mm (SBM5)' },
    "GYM5": { price: 16000, thick: 5, label: 'ゴールドイエローミラー 5mm (GYM5)' },
    // 型・スリ・その他
    "F4K": { price: 3200, thick: 4, label: '型ガラス 4mm (F4K)' },
    "F6K": { price: 5600, thick: 6, label: '型ガラス 6mm (F6K)' },
    "G3": { price: 5600, thick: 3, label: 'スリガラス 3mm (G3)' },
    "G5": { price: 8000, thick: 5, label: 'スリガラス 5mm (G5)' },
    "OPT5": { price: 15200, thick: 5, label: '高透過ガラス 5mm (OPT5)' },
    "OPT6": { price: 16800, thick: 6, label: '高透過ガラス 6mm (OPT6)' },
    "OPT8": { price: 23200, thick: 8, label: '高透過ガラス 8mm (OPT8)' },
    "OPT10": { price: 29600, thick: 10, label: '高透過ガラス 10mm (OPT10)' },
    // タペガラス (フロスト/タペストリー)
    "FTA5": { price: 15200, thick: 5, label: 'タペガラス 5mm (FTA5)' },
    "FTA6": { price: 18400, thick: 6, label: 'タペガラス 6mm (FTA6)' },
    "FTA8": { price: 23200, thick: 8, label: 'タペガラス 8mm (FTA8)' },
    "FTA10": { price: 29600, thick: 10, label: 'タペガラス 10mm (FTA10)' },
    // タペミラー
    "FTAM5": { price: 32000, thick: 5, label: 'タペミラー 5mm (FTAM5)' },
    // 色ガラス・その他
    "GL_BZ": { price: 5600, thick: 5, label: '色ガラス ブロンズ 5mm (GL-BZ)' },
    "GL_DGY": { price: 19200, thick: 5, label: '色ガラス ダークグレー 5mm (GL-DGY)' },
    "GL_GY": { price: 19200, thick: 5, label: '色ガラス グレー 5mm (GL-GY)' },
    "CM_DD": { price: 24000, thick: 5, label: 'ディープダークミラー 5mm (CM-DD)' },
    "LACO": { price: 24000, thick: 5, label: 'ラコベル 5mm (LACO)' },
    "CM_REJ": { price: 24000, thick: 5, label: 'レジャンヌ 5mm (CM-REJ)' },
    "CM_CIN": { price: 35200, thick: 5, label: 'シンディエラ 5mm (CM-CIN)' },
    "CM_BLA": { price: 35200, thick: 5, label: 'ブランネジュ 5mm (CM-BLA)' },
    "LUNA": { price: 44800, thick: 5, label: 'ルナランプ 5mm (LUNA)' },
};

// ① 加工単価マスタ（円/ｍ）※外周メートルあたりの単価
// 厚み: 平磨き(糸面)
export const FLAT_POLISH_PRICES: Record<GlassThickness, number> = {
    3: 400,
    4: 500, // Added for V4.0
    5: 500,
    6: 600,
    8: 800,
    10: 1000,
    12: 1200,
};

// [追加マスタ] 荒ズリ単価 (円/m) ※糸面サンダーの異形計算で使用
export const ROUGH_PRICES: Record<GlassThickness, number> = {
    3: 300,
    4: 350,
    5: 350,
    6: 450,
    8: 600,
    10: 750,
    12: 900
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

// Coefficient logic: 3,4,5,6mm = 1.0; 8,10,12mm = 1.5
export const THICKNESS_MULTIPLIERS: Record<GlassThickness, number> = {
    3: 1.0,
    4: 1.0, // Added for V4.0
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
    'CIRCLE': 3.5,
    'ELLIPSE': 4.5,
    'FAN': 4.5,
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
    'CIRCLE': '円形（丸） (3.5倍)',
    'ELLIPSE': '楕円 (4.5倍)',
    'FAN': '扇形 (4.5倍)',
    'IRREGULAR': '異形 (8倍)',
    'COMPLEX': '複雑異形 (10倍)'
};
