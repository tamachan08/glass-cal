import React from 'react';
import type { GlassThickness } from '../types';

interface GlassInputsProps {
    width: number;
    height: number;
    thickness: GlassThickness;
    unitPrice: number;
    onWidthChange: (val: number) => void;
    onHeightChange: (val: number) => void;
    onThicknessChange: (val: GlassThickness) => void;
    onUnitPriceChange: (val: number) => void;
}

export const GlassInputs: React.FC<GlassInputsProps> = ({
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

            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>㎡単価 (円)</label>
                <input
                    type="number"
                    value={unitPrice || ''}
                    onChange={(e) => onUnitPriceChange(Number(e.target.value))}
                    placeholder="0"
                />
            </div>

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
                    <select
                        value={thickness}
                        onChange={(e) => onThicknessChange(Number(e.target.value) as GlassThickness)}
                    >
                        {[3, 5, 6, 8, 10, 12].map(t => (
                            <option key={t} value={t}>{t} mm</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
