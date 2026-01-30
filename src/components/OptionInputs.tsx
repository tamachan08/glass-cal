import React from 'react';
import type { ProcessingOptions } from '../types';
import { FILM_LABELS } from '../constants';

interface OptionInputsProps {
    options: ProcessingOptions;
    onChange: (options: ProcessingOptions) => void;
}

export const OptionInputs: React.FC<OptionInputsProps> = ({ options, onChange }) => {

    const updateR = (key: keyof ProcessingOptions['rProcessing'], val: number) => {
        onChange({
            ...options,
            rProcessing: { ...options.rProcessing, [key]: val }
        });
    };

    const updateHole = (key: keyof ProcessingOptions['holeProcessing'], val: number) => {
        onChange({
            ...options,
            holeProcessing: { ...options.holeProcessing, [key]: val }
        });
    };

    const updateSpecial = (key: keyof ProcessingOptions['specialProcessing'], val: number) => {
        onChange({
            ...options,
            specialProcessing: { ...options.specialProcessing, [key]: val }
        });
    };

    const renderComplexRows = (
        type: 'notch' | 'eguri' | 'square_hole',
        label: string,
        items: Array<{ totalLength: number; count: number }> | undefined
    ) => {
        const safeItems = items || Array(4).fill({ totalLength: 0, count: 0 });

        return (
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#555' }}>{label}</h4>
                {safeItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'flex-end' }}>
                        <div className="option-item" style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>サイズ (mm)</label>
                            <input
                                type="number" min="0" placeholder={`例: ${type === 'notch' ? 200 : type === 'eguri' ? 300 : 400}`}
                                value={item.totalLength || ''}
                                onChange={e => {
                                    const newItems = [...safeItems];
                                    newItems[index] = { ...item, totalLength: Number(e.target.value) };
                                    onChange({
                                        ...options,
                                        complexProcessing: {
                                            ...(options.complexProcessing || {}),
                                            [type]: newItems
                                        }
                                    });
                                }}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="option-item" style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>個数</label>
                            <input
                                type="number" min="0"
                                value={item.count || ''}
                                onChange={e => {
                                    const newItems = [...safeItems];
                                    newItems[index] = { ...item, count: Number(e.target.value) };
                                    onChange({
                                        ...options,
                                        complexProcessing: {
                                            ...(options.complexProcessing || {}),
                                            [type]: newItems
                                        }
                                    });
                                }}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="glass-card">
            <h2>Step 3: オプション加工（個数）</h2>

            <div className="grid-3">
                {/* R Processing */}
                <div>
                    <h3>R加工</h3>
                    <div className="option-item">
                        <label>〜R15</label>
                        <input type="number" min="0" value={options.rProcessing.r15 || ''} onChange={e => updateR('r15', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>〜R30</label>
                        <input type="number" min="0" value={options.rProcessing.r30 || ''} onChange={e => updateR('r30', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>〜R50</label>
                        <input type="number" min="0" value={options.rProcessing.r50 || ''} onChange={e => updateR('r50', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>〜R100</label>
                        <input type="number" min="0" value={options.rProcessing.r100 || ''} onChange={e => updateR('r100', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>〜R200</label>
                        <input type="number" min="0" value={options.rProcessing.r200 || ''} onChange={e => updateR('r200', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>〜R300</label>
                        <input type="number" min="0" value={options.rProcessing.r300 || ''} onChange={e => updateR('r300', Number(e.target.value))} />
                    </div>
                </div>

                {/* Corner Cut Processing */}
                <div>
                    <h3>スミキリ加工</h3>
                    <div className="option-item">
                        <label>〜30×30</label>
                        <input
                            type="number" min="0"
                            value={options.cornerCutProcessing?.c30 || ''}
                            onChange={e => onChange({ ...options, cornerCutProcessing: { ...options.cornerCutProcessing!, c30: Number(e.target.value) } })}
                        />
                    </div>
                    <div className="option-item">
                        <label>〜50×50</label>
                        <input
                            type="number" min="0"
                            value={options.cornerCutProcessing?.c50 || ''}
                            onChange={e => onChange({ ...options, cornerCutProcessing: { ...options.cornerCutProcessing!, c50: Number(e.target.value) } })}
                        />
                    </div>
                    <div className="option-item">
                        <label>〜100×100</label>
                        <input
                            type="number" min="0"
                            value={options.cornerCutProcessing?.c100 || ''}
                            onChange={e => onChange({ ...options, cornerCutProcessing: { ...options.cornerCutProcessing!, c100: Number(e.target.value) } })}
                        />
                    </div>
                    <div className="option-item">
                        <label>〜200×200</label>
                        <input
                            type="number" min="0"
                            value={options.cornerCutProcessing?.c200 || ''}
                            onChange={e => onChange({ ...options, cornerCutProcessing: { ...options.cornerCutProcessing!, c200: Number(e.target.value) } })}
                        />
                    </div>
                </div>

                {/* Hole Processing */}
                <div>
                    <h3>穴あけ加工</h3>
                    <div className="option-item">
                        <label>φ5〜15</label>
                        <input type="number" min="0" value={options.holeProcessing.d5_15 || ''} onChange={e => updateHole('d5_15', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>φ16〜30</label>
                        <input type="number" min="0" value={options.holeProcessing.d16_30 || ''} onChange={e => updateHole('d16_30', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>φ31〜50</label>
                        <input type="number" min="0" value={options.holeProcessing.d31_50 || ''} onChange={e => updateHole('d31_50', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>φ51〜100</label>
                        <input type="number" min="0" value={options.holeProcessing.d51_100 || ''} onChange={e => updateHole('d51_100', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>φ101〜</label>
                        <input type="number" min="0" value={options.holeProcessing.d101_plus || ''} onChange={e => updateHole('d101_plus', Number(e.target.value))} />
                    </div>
                </div>

                {/* Special Processing */}
                <div>
                    <h3>特殊穴あけ</h3>
                    <div className="option-item">
                        <label>コンセント小（50×100）</label>
                        <input type="number" min="0" value={options.specialProcessing.outletSmall || ''} onChange={e => updateSpecial('outletSmall', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>コンセント大（100×100）</label>
                        <input type="number" min="0" value={options.specialProcessing.outletLarge || ''} onChange={e => updateSpecial('outletLarge', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>換気扇(φ150~250)</label>
                        <input type="number" min="0" value={options.specialProcessing.ventilator || ''} onChange={e => updateSpecial('ventilator', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>丁番加工 (ヶ所)</label>
                        <input type="number" min="0" value={options.specialProcessing.hinge || ''} onChange={e => updateSpecial('hinge', Number(e.target.value))} />
                    </div>
                    <div className="option-item">
                        <label>鍵穴加工 (ヶ所)</label>
                        <input type="number" min="0" value={options.specialProcessing.keyHole || ''} onChange={e => updateSpecial('keyHole', Number(e.target.value))} />
                    </div>

                </div>

                {/* Hikite Processing */}
                <div>
                    <h3>引手加工</h3>
                    <div className="option-item">
                        <label>引手加工 (ヶ所)</label>
                        <input
                            type="number"
                            min="0"
                            value={options.hikiteCount || ''}
                            onChange={e => onChange({ ...options, hikiteCount: Number(e.target.value) })}
                        />
                    </div>
                </div>

                {/* Miratect Processing */}
                <div>
                    <h3>ミラテクト</h3>
                    <div className="option-item">
                        <label>ミラテクト加工</label>
                        <button
                            onClick={() => onChange({ ...options, miratect: !options.miratect })}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: options.miratect ? '#4caf50' : '#f0f0f0',
                                color: options.miratect ? 'white' : 'black',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {options.miratect ? 'あり' : 'なし'}
                        </button>
                    </div>
                </div>

                {/* Complex Processing */}
                <div>
                    <h3>変形加工</h3>
                    {renderComplexRows('notch', '切り欠き (2辺計) ※50単位で', options.complexProcessing?.notch)}
                    {renderComplexRows('eguri', 'エグリ (3辺計) ※50単位で', options.complexProcessing?.eguri)}
                    {renderComplexRows('square_hole', '角穴 (4辺計) ※50単位で', options.complexProcessing?.square_hole)}
                </div>

                {/* Film Processing */}
                <div>
                    <h3>フィルム貼</h3>
                    <div className="option-item">
                        <label>フィルム種類</label>
                        <select
                            value={options.filmType || ''}
                            onChange={e => onChange({ ...options, filmType: e.target.value as any || undefined })}
                            style={{ width: '100%', padding: '0.5rem' }}
                        >
                            <option value="">なし</option>
                            {Object.entries(FILM_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
