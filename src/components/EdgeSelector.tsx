import React from 'react';
import type { EdgeProcessing, ProcessingType, ChamferWidth, SideConfig, EdgeFinish } from '../types';

interface EdgeSelectorProps {
    edge: EdgeProcessing;
    onChange: (edge: EdgeProcessing) => void;
}

const PROCESS_LABELS: Record<ProcessingType, string> = {
    'flat_polish': '平磨き（糸面）',
    'chamfer': '面取り加工',
    'suriawase': 'スリアワセ (磨きx3)',
    'kamaboko': 'かまぼこ磨 (磨きx2)',
    'thunder': '糸面サンダー'
};

export const EdgeSelector: React.FC<EdgeSelectorProps> = ({ edge, onChange }) => {

    const updateSide = (side: keyof EdgeProcessing, updates: Partial<SideConfig>) => {
        onChange({
            ...edge,
            [side]: { ...edge[side], ...updates }
        });
    };

    // Helper to render a single side configurator
    const renderSideConfig = (side: keyof EdgeProcessing, label: string) => {
        const config = edge[side];
        return (
            <div className="side-config-card" style={{
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: config.enabled ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                opacity: config.enabled ? 1 : 0.6
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>{label}</h3>
                    <label className="toggle-switch" style={{ fontSize: '0.8rem' }}>
                        <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(e) => updateSide(side, { enabled: e.target.checked })}
                        />
                        <span>{config.enabled ? '有効' : '無効'}</span>
                    </label>
                </div>

                {config.enabled && (
                    <div className="grid-2">
                        {/* Type Selector */}
                        <div className="form-group">
                            <label>加工種別</label>
                            <select
                                value={config.type}
                                onChange={(e) => {
                                    const newType = e.target.value as ProcessingType;
                                    const updates: Partial<SideConfig> = { type: newType };
                                    if (newType === 'chamfer' && !config.chamferWidth) {
                                        updates.chamferWidth = '12';
                                        updates.polishChamferEdge = true;
                                    }
                                    updateSide(side, updates);
                                }}
                            >
                                {Object.entries(PROCESS_LABELS).map(([key, text]) => (
                                    <option key={key} value={key}>{text}</option>
                                ))}
                            </select>
                        </div>

                        {/* Finish Selector */}
                        <div className="form-group">
                            <label>仕上げ</label>
                            <select
                                value={config.finish}
                                onChange={(e) => updateSide(side, { finish: e.target.value as EdgeFinish })}
                            >
                                <option value="migaki">磨き (Migaki)</option>
                                <option value="arazuri">荒摺り (Arazuri) - 10% OFF</option>
                            </select>
                        </div>

                        {/* Chamfer Options */}
                        {config.type === 'chamfer' && (
                            <div className="form-group" style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div>
                                        <label style={{ marginRight: '0.5rem' }}>面取り幅</label>
                                        <select
                                            value={config.chamferWidth}
                                            onChange={(e) => updateSide(side, { chamferWidth: e.target.value as ChamferWidth })}
                                        >
                                            <option value="12">〜12mm</option>
                                            <option value="18">〜18mm</option>
                                            <option value="24">〜24mm</option>
                                            <option value="25_plus">25mm〜</option>
                                        </select>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={config.polishChamferEdge}
                                            onChange={(e) => updateSide(side, { polishChamferEdge: e.target.checked })}
                                            style={{ marginRight: '0.25rem' }}
                                        />
                                        小口磨き
                                    </label>
                                </div>
                                {config.chamferWidth === '12' && !config.polishChamferEdge && (
                                    <div style={{ color: 'orange', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                        ※「〜12mm」は小口磨きあり(900円)固定等
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Batch Update Function
    const applyToAll = (
        type: ProcessingType,
        finish: EdgeFinish,
        chamferWidth?: ChamferWidth,
        polishChamferEdge?: boolean
    ) => {
        const sides: (keyof EdgeProcessing)[] = ['top', 'bottom', 'left', 'right'];
        const newEdge = { ...edge };
        sides.forEach(side => {
            if (newEdge[side].enabled) {
                newEdge[side] = {
                    ...newEdge[side],
                    type,
                    finish,
                    chamferWidth: type === 'chamfer' ? (chamferWidth || '12') : undefined,
                    polishChamferEdge: type === 'chamfer' ? (polishChamferEdge ?? true) : undefined
                };
            }
        });
        onChange(newEdge);
    };

    return (
        <div className="glass-card">
            <h2>Step 2: エッジ加工 (辺ごと)</h2>

            <div className="batch-controls" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>一括設定 (有効な辺のみ)</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => applyToAll('flat_polish', 'migaki')}>全て平磨き(磨き)</button>
                    <button onClick={() => applyToAll('flat_polish', 'arazuri')}>全て平磨き(荒摺り)</button>
                    <button onClick={() => applyToAll('suriawase', 'migaki')}>全てスリアワセ</button>
                    <button onClick={() => applyToAll('kamaboko', 'migaki')}>全てかまぼこ磨</button>
                    <button onClick={() => applyToAll('thunder', 'arazuri')}>全て糸面サンダー</button>
                </div>
            </div>

            <div className="sides-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {renderSideConfig('top', '上辺 (Top)')}
                {renderSideConfig('bottom', '下辺 (Bottom)')}
                {renderSideConfig('left', '左辺 (Left)')}
                {renderSideConfig('right', '右辺 (Right)')}
            </div>
        </div>
    );
};
