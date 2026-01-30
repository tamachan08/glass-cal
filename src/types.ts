export type GlassThickness = 3 | 4 | 5 | 6 | 8 | 10 | 12;

export type GlassMode = 'standard' | 'manual';

export type ShapeType =
  | 'RECT'
  | 'CORNER_1' | 'CORNER_2'
  | 'TENMARU_1' | 'TENMARU_2'
  | 'CIRCLE' | 'ELLIPSE' | 'FAN'
  | 'HEXAGON' | 'OCTAGON'
  | 'IRREGULAR' | 'COMPLEX';

export type ProcessingType = 'flat_polish' | 'chamfer' | 'suriawase' | 'kamaboko' | 'thunder';

export type ChamferWidth = '12' | '18' | '24' | '25_plus';

export type EdgeFinish = 'migaki' | 'arazuri';

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

export interface RProcessingOptions {
  r15: number;
  r30: number;
  r50: number;
  r100: number;
  r200: number;
  r300: number;
}

export interface CornerCutOptions {
  c30: number;
  c50: number;
  c100: number;
  c200: number;
}

export interface HoleProcessingOptions {
  d5_15: number;
  d16_30: number;
  d31_50: number;
  d51_100: number;
  d101_plus: number;
}

export interface SpecialProcessingOptions {
  outletSmall: number;
  outletLarge: number;
  ventilator: number;
  hinge: number;
  keyHole: number;
}

export interface ComplexItem {
  totalLength: number; // Total perimeter of this feature in mm
  count: number;       // Number of instances
}

export interface ComplexProcessingOptions {
  notch: ComplexItem[];       // Kirikaki
  eguri: ComplexItem[];       // Eguri
  square_hole: ComplexItem[]; // Square Hole (Ana)
}

export type FilmType = 'shatterproof' | 'tn200' | 'glasstect' | 'foglas' | 'milky';

export interface ProcessingOptions {
  rProcessing: RProcessingOptions;
  cornerCutProcessing: CornerCutOptions;
  holeProcessing: HoleProcessingOptions;
  specialProcessing: SpecialProcessingOptions;
  hikiteCount: number;
  miratect: boolean;
  filmType?: FilmType;
  filmDelivery: boolean;
  filmPickup: boolean;
  complexProcessing: ComplexProcessingOptions;
}

export interface GlassDimensions {
  width: number;
  height: number;
  thickness: GlassThickness;
}

export interface CalculationResult {
  areaM2: number;
  perimeter: number;
  edgeFee: number;
  optionFee: number;
  filmFee: number;
  glassCost: number;
  totalFee: number;
}
