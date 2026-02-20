
import { calculateEdgeFee } from './src/logic/calculator';
import type { GlassDimensions, EdgeProcessing } from './src/types';

const dimensions: GlassDimensions = {
    width: 1000,
    height: 1000,
    thickness: 5,
};

const edge: EdgeProcessing = {
    top: { enabled: true, type: 'chamfer', finish: 'migaki', chamferWidth: '25_plus', polishChamferEdge: false },
    bottom: { enabled: false, type: 'flat_polish', finish: 'migaki' },
    left: { enabled: false, type: 'flat_polish', finish: 'migaki' },
    right: { enabled: false, type: 'flat_polish', finish: 'migaki' },
};

const fee = calculateEdgeFee(dimensions, edge, 'RECT', 5000);
console.log(`Dimensions: ${dimensions.width}x${dimensions.height}, Edge: Chamfer 25mm+ (No Polish)`);
console.log(`Calculated Edge Fee: ${fee}`);

// Expected:
// Length = 1m
// Price should be 2700 (Current) or 2500 (Target)
// Fee = 1 * Price
