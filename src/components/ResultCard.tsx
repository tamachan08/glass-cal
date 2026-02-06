import React from 'react';
import type { CalculationResult } from '../types';

interface ResultCardProps {
    result: CalculationResult;
    isExpress?: boolean;
    onExpressChange?: (val: boolean) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, isExpress = false, onExpressChange }) => {
    return (
        <div className="glass-card result-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>計算結果</h2>
                {onExpressChange && (
                    <button
                        onClick={() => onExpressChange(!isExpress)}
                        style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            borderRadius: '20px',
                            border: '1px solid',
                            cursor: 'pointer',
                            backgroundColor: isExpress ? '#ff4081' : 'transparent',
                            borderColor: isExpress ? '#ff4081' : 'rgba(255,255,255,0.5)',
                            color: isExpress ? 'white' : 'white',
                            transition: 'all 0.2s',
                            boxShadow: isExpress ? '0 0 10px rgba(255, 64, 129, 0.5)' : 'none'
                        }}
                    >
                        {isExpress ? '特急便 ON' : '特急便 OFF'}
                    </button>
                )}
            </div>

            <div className="result-row">
                <span>ガラス面積</span>
                <span>{result.areaM2.toFixed(3)} ㎡</span>
            </div>
            <div className="result-row">
                <span>外周距離</span>
                <span>{result.perimeter} m</span>
            </div>
            <div className="result-row">
                <span>硝子生地代</span>
                <span>¥{result.glassCost.toLocaleString()}</span>
            </div>
            <div className="result-row" style={{ color: isExpress ? '#ff80ab' : 'inherit' }}>
                <span>
                    エッジ加工費
                    {isExpress && <small style={{ marginLeft: '0.5rem', fontSize: '0.7em' }}>(x1.2)</small>}
                </span>
                <span>¥{result.edgeFee.toLocaleString()}</span>
            </div>
            <div className="result-row">
                <span>オプション加工費</span>
                <span>¥{result.optionFee.toLocaleString()}</span>
            </div>

            <div className="result-row" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <span>小計</span>
                <span>¥{result.subtotal.toLocaleString()}</span>
            </div>

            {result.filmFee > 0 && (
                <div className="result-row" style={{ marginTop: '0.5rem' }}>
                    <span>フィルム貼代</span>
                    <span>¥{result.filmFee.toLocaleString()}</span>
                </div>
            )}
            <div className="result-row total">
                <span>合計金額</span>
                <span>¥{result.totalFee.toLocaleString()}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.8, fontSize: '0.9rem' }}>
                ※表示価格は税抜です
            </div>
        </div>
    );
};
