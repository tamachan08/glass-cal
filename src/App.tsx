import { useState, useMemo } from 'react';
import { GlassInputs } from './components/GlassInputs';
import { EdgeSelector } from './components/EdgeSelector';
import { OptionInputs } from './components/OptionInputs';
import { ResultCard } from './components/ResultCard';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions } from './types';
import { calculateTotal } from './logic/calculator';

function App() {
  const [dimensions, setDimensions] = useState<GlassDimensions>({
    width: 0,
    height: 0,
    thickness: 5 // Default 5mm
  });
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const [edge, setEdge] = useState<EdgeProcessing>({
    type: 'flat_polish',
    finish: 'migaki',
    processedSides: { top: true, bottom: true, left: true, right: true }
  });

  const [options, setOptions] = useState<ProcessingOptions>({
    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
    hikiteCount: 0
  });

  const result = useMemo(() => {
    return calculateTotal(dimensions, edge, options, unitPrice);
  }, [dimensions, edge, options, unitPrice]);

  return (
    <div className="app-container">
      <h1>ガラス加工賃計算アプリ</h1>

      <GlassInputs
        width={dimensions.width}
        height={dimensions.height}
        thickness={dimensions.thickness}
        unitPrice={unitPrice}
        onWidthChange={(w) => setDimensions(p => ({ ...p, width: w }))}
        onHeightChange={(h) => setDimensions(p => ({ ...p, height: h }))}
        onThicknessChange={(t) => setDimensions(p => ({ ...p, thickness: t }))}
        onUnitPriceChange={setUnitPrice}
      />

      <EdgeSelector
        edge={edge}
        onChange={setEdge}
      />

      <OptionInputs
        options={options}
        onChange={setOptions}
      />

      <ResultCard result={result} />
    </div>
  );
}

export default App;
