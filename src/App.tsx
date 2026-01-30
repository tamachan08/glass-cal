import { useState, useMemo } from 'react';
import { GlassInputs } from './components/GlassInputs';
import { ShapeSelector } from './components/ShapeSelector';
import { EdgeSelector } from './components/EdgeSelector';
import { OptionInputs } from './components/OptionInputs';
import { ResultCard } from './components/ResultCard';
import type { GlassDimensions, EdgeProcessing, ProcessingOptions, ShapeType, GlassMode } from './types';
import { calculateTotal } from './logic/calculator';
import { MATERIAL_DB } from './constants';

function App() {
  // V4.0 State
  const [mode, setMode] = useState<GlassMode>('standard');
  const [materialCode, setMaterialCode] = useState<string>('');

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
    specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
    hikiteCount: 0,
    miratect: false,
    filmType: undefined,
    complexProcessing: {
      notch: Array(4).fill({ totalLength: 0, count: 0 }),
      eguri: Array(4).fill({ totalLength: 0, count: 0 }),
      square_hole: Array(4).fill({ totalLength: 0, count: 0 })
    }
  });

  // Express Delivery State
  const [isExpress, setIsExpress] = useState<boolean>(false);

  const handleReset = () => {
    if (!window.confirm('入力内容を全てリセットしますか？')) return;

    setMode('standard');
    setMaterialCode('');
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
      specialProcessing: { outletSmall: 0, outletLarge: 0, ventilator: 0, hinge: 0, keyHole: 0 },
      hikiteCount: 0,
      miratect: false,
      filmType: undefined,
      complexProcessing: {
        notch: Array(4).fill({ totalLength: 0, count: 0 }),
        eguri: Array(4).fill({ totalLength: 0, count: 0 }),
        square_hole: Array(4).fill({ totalLength: 0, count: 0 })
      }
    });
    setIsExpress(false);
  };

  const handleModeChange = (newMode: GlassMode) => {
    setMode(newMode);
    if (newMode === 'standard') {
      // Reset custom values when switching to standard to avoid confusion? 
      // Or keep them? Let's reset to force selection.
      setMaterialCode('');
      setUnitPrice(0);
      setDimensions(p => ({ ...p, thickness: 5 }));
    } else {
      // Manual mode default
      setMaterialCode('');
      setUnitPrice(0);
      setDimensions(p => ({ ...p, thickness: 5 }));
    }
  };

  const handleMaterialCodeChange = (code: string) => {
    setMaterialCode(code);
    const info = MATERIAL_DB[code];
    if (info) {
      setUnitPrice(info.price);
      setDimensions(p => ({ ...p, thickness: info.thick }));
    } else {
      setUnitPrice(0);
    }
  };

  const result = useMemo(() => {
    return calculateTotal(dimensions, edge, shape, options, unitPrice, isExpress);
  }, [dimensions, edge, shape, options, unitPrice, isExpress]);

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
        mode={mode}
        onModeChange={handleModeChange}
        materialCode={materialCode}
        onMaterialCodeChange={handleMaterialCodeChange}
        width={dimensions.width}
        height={dimensions.height}
        thickness={dimensions.thickness}
        unitPrice={unitPrice}
        onWidthChange={(w) => setDimensions(p => ({ ...p, width: w }))}
        onHeightChange={(h) => setDimensions(p => ({ ...p, height: h }))}
        onThicknessChange={(t) => setDimensions(p => ({ ...p, thickness: t }))}
        onUnitPriceChange={setUnitPrice}
      />

      {/* Result Card with Express Option */}
      <ResultCard
        result={result}
        isExpress={isExpress}
        onExpressChange={setIsExpress}
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

      <footer style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
        v2.0 (Shape Multipliers)
      </footer>
    </div>
  );
}
export default App;
