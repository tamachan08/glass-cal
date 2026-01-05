import React from 'react';
import { SHAPE_LABELS } from '../constants';
import type { ShapeType } from '../types';

interface ShapeSelectorProps {
    shape: ShapeType;
    onChange: (shape: ShapeType) => void;
}

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({ shape, onChange }) => {
    return (
        <div className="glass-card">
            <h2>Step 2-A: ガラスの形 (形状倍率)</h2>
            <div className="form-group">
                <label>形状を選択</label>
                <select
                    value={shape}
                    onChange={(e) => onChange(e.target.value as ShapeType)}
                    style={{ fontSize: '1rem', padding: '0.5rem' }}
                >
                    {Object.entries(SHAPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                ※形状に応じてエッジ加工費に倍率がかかります。<br />
                ※外周計算は「最大幅×最大高さ」の矩形として計算されます。
            </div>
        </div>
    );
};
