import React from 'react';
import type { GlassThickness, GlassMode } from '../types';
import { MATERIAL_DB } from '../constants';

interface GlassInputsProps {
    mode: GlassMode;
    onModeChange: (val: GlassMode) => void;
    materialCode: string;
    onMaterialCodeChange: (val: string) => void;

    width: number;
    height: number;
    thickness: GlassThickness;
    unitPrice: number;
    onWidthChange: (val: number) => void;
    onHeightChange: (val: number) => void;
    onThicknessChange: (val: GlassThickness) => void; // Used in Manual Mode
    onUnitPriceChange: (val: number) => void; // Used in Manual Mode
}

export const GlassInputs: React.FC<GlassInputsProps> = ({
    mode,
    onModeChange,
    materialCode,
    onMaterialCodeChange,
    width,
    height,
    thickness,
    unitPrice,
    onWidthChange,
    onHeightChange,
    onThicknessChange,
    onUnitPriceChange
}) => {
    return (
        <div className="glass-card">
            <h2>Step 1: ガラスサイズ・厚み・生地</h2>

            {/* A. Mode Switch */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>入力モード選択</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="radio"
                            name="mode"
                            value="standard"
                            checked={mode === 'standard'}
                            onChange={() => onModeChange('standard')}
                            style={{ marginRight: '0.5rem' }}
                        />
                        標準ガラスから選ぶ
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="radio"
                            name="mode"
                            value="manual"
                            checked={mode === 'manual'}
                            onChange={() => onModeChange('manual')}
                            style={{ marginRight: '0.5rem' }}
                        />
                        特注ガラス (手入力)
                    </label>
                </div>
            </div>

            {/* B. Mode-Specific Inputs */}
            {mode === 'standard' ? (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>ガラス品種</label>
                    <select
                        value={materialCode}
                        onChange={(e) => onMaterialCodeChange(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    >
                        <option value="">選択してください</option>
                        {Object.entries(MATERIAL_DB).map(([code, info]) => (
                            <option key={code} value={code}>
                                {info.label} ({info.price.toLocaleString()}円/㎡)
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>㎡単価 (円)</label>
                    <input
                        type="number"
                        value={unitPrice || ''}
                        onChange={(e) => onUnitPriceChange(Number(e.target.value))}
                        placeholder="例: 25000"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>
            )}

            {/* Common Inputs */}
            <div className="grid-3">
                <div className="form-group">
                    <label>横幅 (mm)</label>
                    <input
                        type="number"
                        value={width || ''}
                        onChange={(e) => onWidthChange(Number(e.target.value))}
                        placeholder="例: 900"
                    />
                </div>
                <div className="form-group">
                    <label>高さ (mm)</label>
                    <input
                        type="number"
                        value={height || ''}
                        onChange={(e) => onHeightChange(Number(e.target.value))}
                        placeholder="例: 1800"
                    />
                </div>
                <div className="form-group">
                    <label>厚み</label>
                    {mode === 'standard' ? (
                        <input
                            type="text"
                            value={`${thickness} mm`}
                            disabled
                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        />
                    ) : (
                        <select
                            value={thickness}
                            onChange={(e) => onThicknessChange(Number(e.target.value) as GlassThickness)}
                        >
                            {[3, 4, 5, 6, 8, 10, 12].map(t => (
                                <option key={t} value={t}>{t} mm</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {mode === 'standard' && width > 0 && height > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    ※計算面積: {Math.max((width * height) / 1000000, 0.1).toFixed(2)} ㎡ (最低0.1㎡)
                </div>
            )}
        </div>
    );
};
