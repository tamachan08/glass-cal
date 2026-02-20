
import { calculateEdgeFee } from './src/logic/calculator';
import type { GlassDimensions, EdgeProcessing } from './src/types';

const dimensions: GlassDimensions = {
    width: 1000,
    height: 1000,
    thickness: 5,
};

// Case 1: Chamfer 25mm+, Arazuri selected, BUT Polish Checkbox OFF (No Polish)
// Should use 'unpolished' price (2500) and NO discount (multiplier 1.0) -> 2500
const edgeNoPolish: EdgeProcessing = {
    top: { enabled: true, type: 'chamfer', finish: 'arazuri', chamferWidth: '25_plus', polishChamferEdge: false },
    bottom: { enabled: false, type: 'flat_polish', finish: 'migaki' },
    left: { enabled: false, type: 'flat_polish', finish: 'migaki' },
    right: { enabled: false, type: 'flat_polish', finish: 'migaki' },
};

// Case 2: Chamfer 25mm+, Migaki selected, Polish Checkbox OFF (No Polish)
// Should use 'unpolished' price (2500) and NO discount -> 2500
const edgeMigakiNoPolish: EdgeProcessing = {
    top: { enabled: true, type: 'chamfer', finish: 'migaki', chamferWidth: '25_plus', polishChamferEdge: false },
    bottom: { enabled: false, type: 'flat_polish', finish: 'migaki' },
    left: { enabled: false, type: 'flat_polish', finish: 'migaki' },
    right: { enabled: false, type: 'flat_polish', finish: 'migaki' },
};

console.log('--- Verification: Chamfer No Polish Logic ---');

const fee1 = calculateEdgeFee(dimensions, edgeNoPolish, 'RECT', 5000);
console.log(`Case 1 (Arazuri, No Polish): ${fee1} (Expected: 2500)`);

const fee2 = calculateEdgeFee(dimensions, edgeMigakiNoPolish, 'RECT', 5000);
console.log(`Case 2 (Migaki, No Polish): ${fee2} (Expected: 2500)`);
