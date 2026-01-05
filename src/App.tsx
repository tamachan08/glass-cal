import { useState, useMemo } from 'react';
import { GlassInputs } from './components/GlassInputs';
import { ShapeSelector } from './components/ShapeSelector';
import { EdgeSelector } from './components/EdgeSelector';
import { OptionInputs } from './components/OptionInputs';
import { ResultCard } from './components/ResultCard';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions, ShapeType } from './types';
import { calculateTotal } from './logic/calculator';

function App() {
  const [dimensions, setDimensions] = useState<GlassDimensions>({
    width: 0,
    height: 0,
    thickness: 5 // Default 5mm
  });
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [shape, setShape] = useState<ShapeType>('RECT');

  const defaultSideConfig: import('./types').SideConfig = {
    enabled: true,
    type: 'flat_polish',
    finish: 'migaki'
  };

  const [edge, setEdge] = useState<EdgeProcessing>({
    top: { ...defaultSideConfig },
    bottom: { ...defaultSideConfig },
    left: { ...defaultSideConfig },
    right: { ...defaultSideConfig }
  });

  const [options, setOptions] = useState<ProcessingOptions>({
    rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
    cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
    holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
    hikiteCount: 0,
    complexProcessing: {
      notch: Array(4).fill({ totalLength: 0, count: 0 }),
      eguri: Array(4).fill({ totalLength: 0, count: 0 }),
      square_hole: Array(4).fill({ totalLength: 0, count: 0 })
    }
  });

  const handleReset = () => {
    if (!window.confirm('入力内容を全てリセットしますか？')) return;

    setDimensions({ width: 0, height: 0, thickness: 5 });
    setUnitPrice(0);
    setShape('RECT');
    setEdge({
      top: { ...defaultSideConfig },
      bottom: { ...defaultSideConfig },
      left: { ...defaultSideConfig },
      right: { ...defaultSideConfig }
    });
    setOptions({
      rProcessing: { r15: 0, r30: 0, r50: 0, r100: 0, r200: 0, r300: 0 },
      cornerCutProcessing: { c30: 0, c50: 0, c100: 0, c200: 0 },
      holeProcessing: { d5_15: 0, d16_30: 0, d31_50: 0, d51_100: 0, d101_plus: 0 },
      specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0 },
      hikiteCount: 0,
      complexProcessing: {
        notch: Array(4).fill({ totalLength: 0, count: 0 }),
        eguri: Array(4).fill({ totalLength: 0, count: 0 }),
        square_hole: Array(4).fill({ totalLength: 0, count: 0 })
      }
    });
  };

  const result = useMemo(() => {
    return calculateTotal(dimensions, edge, shape, options, unitPrice);
  }, [dimensions, edge, shape, options, unitPrice]);

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>ガラス加工賃計算アプリ</h1>
        <button
          onClick={handleReset}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255, 100, 100, 0.2)',
            border: '1px solid rgba(255, 100, 100, 0.5)',
            color: '#d32f2f',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)'
          }}
        >
          リセット
        </button>
      </div>

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

      <ShapeSelector
        shape={shape}
        onChange={setShape}
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
      <footer style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
        v2.0 (Shape Multipliers)
      </footer>
    </div>
  );
}
export default App;
