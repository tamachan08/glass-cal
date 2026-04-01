import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // 簡易的なアクセス制限（デモ用）
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'glass123') { 
      setAuthenticated(true);
      fetchData();
    } else {
      alert('パスワードが違います。');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Supabaseから履歴データを新しい順に取得
      const { data, error } = await supabase
        .from('calculation_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("データの取得に失敗しました:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#333' }}>管理ダッシュボード ログイン</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="パスワード (glass123)" 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
          <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            ログイン
          </button>
        </form>
      </div>
    );
  }

  // 分析データ計算
  const totalCalculations = logs.length;
  
  const glassTypeCounts = logs.reduce((acc, log) => {
    acc[log.glass_type] = (acc[log.glass_type] || 0) + 1;
    return acc;
  }, {});
  
  const glassData = Object.keys(glassTypeCounts)
    .map(key => ({ name: key, count: glassTypeCounts[key] }))
    .sort((a,b) => b.count - a.count);

  const maxCount = glassData.length > 0 ? glassData[0].count : 1;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', color: '#1f2937' }}>
        <LayoutDashboard size={36} color="#3b82f6" />
        <h1 style={{ margin: 0, fontSize: '2rem' }}>計算履歴分析ダッシュボード</h1>
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>データを読み込み中...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* KPI Card */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a' }}>
              <Activity size={24}/> 総計算回数
            </h3>
            <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: '16px 0 0 0', color: '#1d4ed8' }}>
              {totalCalculations} <span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>回</span>
            </p>
          </div>

          {/* Custom HTML Bar Chart */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', gridColumn: '1 / -1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginTop: 0, color: '#374151', marginBottom: '20px' }}>ガラス品種別 人気ランキング</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {glassData.length === 0 ? (
                <p style={{ color: '#9ca3af' }}>データがありません</p>
              ) : (
                glassData.map((item, index) => {
                  const widthPercent = (item.count / maxCount) * 100;
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '120px', textAlign: 'right', fontWeight: 'bold', color: '#4b5563', fontSize: '0.9rem' }}>
                        {item.name}
                      </div>
                      <div style={{ flex: 1, height: '28px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${widthPercent}%`, height: '100%', background: '#3b82f6', transition: 'width 0.5s ease-out' }}></div>
                      </div>
                      <div style={{ width: '40px', fontWeight: 'bold', color: '#1f2937' }}>
                        {item.count}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Logs Table */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', gridColumn: '1 / -1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginTop: 0, color: '#374151', marginBottom: '16px' }}>最近の計算履歴（直近10件）</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.9rem' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>計算日時</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>ガラス種類</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>サイズ(幅×高)</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>厚み</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>合計金額</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 10).map((log, i) => (
                    <tr key={log.id || i} style={{ borderBottom: '1px solid #f3f4f6', color: '#374151' }}>
                      <td style={{ padding: '12px 16px' }}>{new Date(log.created_at).toLocaleString('ja-JP')}</td>
                      <td style={{ padding: '12px 16px' }}>
                         <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{log.glass_type}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{log.width_mm}mm × {log.height_mm}mm</td>
                      <td style={{ padding: '12px 16px' }}>{log.thickness}mm</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold' }}>¥{log.total_fee.toLocaleString()}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>まだ履歴データがありません。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
