import React from 'react';
import type { CalculationResult } from '../types';

interface ResultCardProps {
    result: CalculationResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
    return (
        <div className="glass-card result-box">
            <h2>計算結果</h2>
            <div className="result-row">
                <span>外周距離</span>
                <span>{result.perimeter} m</span>
            </div>
            <div className="result-row">
                <span>硝子生地代</span>
                <span>¥{result.glassCost.toLocaleString()}</span>
            </div>
            <div className="result-row">
                <span>エッジ加工費</span>
                <span>¥{result.edgeFee.toLocaleString()}</span>
            </div>
            <div className="result-row">
                <span>オプション加工費</span>
                <span>¥{result.optionFee.toLocaleString()}</span>
            </div>
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
