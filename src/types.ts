export type GlassThickness = 3 | 5 | 6 | 8 | 10 | 12;

export type ProcessingType = 'flat_polish' | 'chamfer';

export type ChamferWidth = '12' | '18' | '24'; // ~12mm, ~18mm, ~24mm

export type OptionType = 'R_processing' | 'hole_processing' | 'special_processing';

export interface GlassDimensions {
  width: number; // mm
  height: number; // mm
  thickness: GlassThickness;
}

export type EdgeFinish = 'migaki' | 'arazuri'; // Polished (Default) vs Rough (0.9x)

export interface EdgeProcessing {
  type: ProcessingType;
  chamferWidth?: ChamferWidth; // Required if type is 'chamfer'
  polishChamferEdge?: boolean; // Default true, applicable if type is 'chamfer'
  finish: EdgeFinish;
  processedSides: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
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
}

export interface CalculationResult {
  perimeter: number; // meters
  edgeFee: number;
  optionFee: number;
  glassCost: number;
  totalFee: number;
}
