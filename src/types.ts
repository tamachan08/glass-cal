export type GlassThickness = 3 | 5 | 6 | 8 | 10 | 12;

export type ProcessingType = 'flat_polish' | 'chamfer' | 'suriawase' | 'kamaboko';

export type ChamferWidth = '12' | '18' | '24' | '25_plus'; // ~12mm, ~18mm, ~24mm, 25mm+

export type ShapeType =
  | 'RECT'
  | 'CORNER_1'
  | 'CORNER_2'
  | 'TENMARU_1'
  | 'HEXAGON'
  | 'TENMARU_2'
  | 'OCTAGON'
  | 'CIRCLE'
  | 'ELLIPSE'
  | 'FAN'
  | 'IRREGULAR'
  | 'COMPLEX';

export type OptionType = 'R_processing' | 'hole_processing' | 'special_processing';

export type ComplexProcessingType = 'notch' | 'eguri' | 'square_hole';

export interface GlassDimensions {
  width: number; // mm
  height: number; // mm
  thickness: GlassThickness;
}

export type EdgeFinish = 'migaki' | 'arazuri'; // Polished (Default) vs Rough (0.9x)

export interface SideConfig {
  enabled: boolean;
  type: ProcessingType;
  finish: EdgeFinish;
  chamferWidth?: ChamferWidth;
  polishChamferEdge?: boolean;
}

export interface EdgeProcessing {
  top: SideConfig;
  bottom: SideConfig;
  left: SideConfig;
  right: SideConfig;
}

export interface ProcessingOptions {
  rProcessing: {
    r15: number;
    r30: number;
    r50: number;
    r100: number;
    r200: number;
    r300: number;
  };
  cornerCutProcessing: {
    c30: number;
    c50: number;
    c100: number;
    c200: number;
  };
  holeProcessing: {
    d5_15: number;
    d16_30: number;
    d31_50: number;
    d51_100: number;
    d101_plus: number;
  };
  specialProcessing: {
    outletSmall: number;
    outletLarge: number;
    ventilator: number;
  };
  hikiteCount: number; // Finger Pull
  complexProcessing?: {
    notch?: Array<{ totalLength: number; count: number }>;
    eguri?: Array<{ totalLength: number; count: number }>;
    square_hole?: Array<{ totalLength: number; count: number }>;
  };
}

export interface CalculationResult {
  areaM2: number; // square meters
  perimeter: number; // meters
  edgeFee: number;
  optionFee: number;
  glassCost: number;
  totalFee: number;
}
