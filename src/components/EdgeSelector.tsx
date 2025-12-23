import type { EdgeProcessing, ProcessingType, ChamferWidth } from '../types';

interface EdgeSelectorProps {
    edge: EdgeProcessing;
    onChange: (edge: EdgeProcessing) => void;
}

export const EdgeSelector: React.FC<EdgeSelectorProps> = ({ edge, onChange }) => {

    const handleTypeChange = (type: ProcessingType) => {
        // defaults
        if (type === 'flat_polish') {
            onChange({ ...edge, type });
        } else {
            onChange({
                ...edge,
                type,
                chamferWidth: '12',
                polishChamferEdge: true
            });
        }
    };

    const updateChamfer = (updates: Partial<EdgeProcessing>) => {
        onChange({ ...edge, ...updates });
    };

    const toggleSide = (side: keyof EdgeProcessing['processedSides']) => {
        onChange({
            ...edge,
            processedSides: {
                ...edge.processedSides,
                [side]: !edge.processedSides[side]
            }
        });
    };

    return (
        <div className="glass-card">
            <h2>Step 2: エッジ加工</h2>
            <div className="form-group">
                <label>加工種別</label>
                <div className="radio-group">
                    <label className={`radio-label ${edge.type === 'flat_polish' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="edgeType"
                            checked={edge.type === 'flat_polish'}
                            onChange={() => handleTypeChange('flat_polish')}
                        />
                        平磨き（糸面）
                    </label>
                    <label className={`radio-label ${edge.type === 'chamfer' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="edgeType"
                            checked={edge.type === 'chamfer'}
                            onChange={() => handleTypeChange('chamfer')}
                        />
                        面取り加工
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label>仕上げ</label>
                <div className="radio-group" style={{ marginBottom: '1rem' }}>
                    <label className={`radio-label ${edge.finish === 'migaki' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="finish"
                            checked={edge.finish === 'migaki'}
                            onChange={() => onChange({ ...edge, finish: 'migaki' })}
                        />
                        磨き (Migaki)
                    </label>
                    <label className={`radio-label ${edge.finish === 'arazuri' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="finish"
                            checked={edge.finish === 'arazuri'}
                            onChange={() => onChange({ ...edge, finish: 'arazuri' })}
                        />
                        荒摺り (Arazuri) - 10% OFF
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label>加工箇所 (デフォルト: 4方)</label>
                <div className="radio-group">
                    <label className={`radio-label ${edge.processedSides.top ? 'selected' : ''}`}>
                        <input type="checkbox" checked={edge.processedSides.top} onChange={() => toggleSide('top')} /> 上
                    </label>
                    <label className={`radio-label ${edge.processedSides.bottom ? 'selected' : ''}`}>
                        <input type="checkbox" checked={edge.processedSides.bottom} onChange={() => toggleSide('bottom')} /> 下
                    </label>
                    <label className={`radio-label ${edge.processedSides.left ? 'selected' : ''}`}>
                        <input type="checkbox" checked={edge.processedSides.left} onChange={() => toggleSide('left')} /> 左
                    </label>
                    <label className={`radio-label ${edge.processedSides.right ? 'selected' : ''}`}>
                        <input type="checkbox" checked={edge.processedSides.right} onChange={() => toggleSide('right')} /> 右
                    </label>
                </div>
            </div>

            {edge.type === 'chamfer' && (
                <div className="chamfer-options" style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '3px solid white' }}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>面取り幅</label>
                            <select
                                value={edge.chamferWidth}
                                onChange={(e) => updateChamfer({ chamferWidth: e.target.value as ChamferWidth })}
                            >
                                <option value="12">〜12mm</option>
                                <option value="18">〜18mm</option>
                                <option value="24">〜24mm</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>小口磨き</label>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={edge.polishChamferEdge}
                                    onChange={(e) => updateChamfer({ polishChamferEdge: e.target.checked })}
                                />
                                <span>面取り部の小口を磨く</span>
                            </label>
                        </div>
                    </div>

                    {edge.chamferWidth === '12' && !edge.polishChamferEdge && (
                        <div className="alert">
                            <strong>注意:</strong> 「〜12mm」で「小口磨きなし」の設定はありません。
                            自動的に「小口磨きあり」の価格（900円/m）が適用されます。
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
