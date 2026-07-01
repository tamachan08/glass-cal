import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  Search, 
  TrendingUp, 
  HelpCircle, 
  Package, 
  Calendar,
  Lock
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MATERIAL_DB } from '../constants';

export default function Dashboard() {
  // --- States ---
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      setLoading(true);
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

  // ログイン認証が有効になったらデータをロード
  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'glass123') {
      setAuthenticated(true);
    } else {
      alert('パスワードが違います。');
    }
  };

  // ============== データ分析・構造化ロジック ==============

  // 1. ログデータのクレンジングと表示名の正規化
  const normalizedLogs = useMemo(() => {
    return logs.map(log => {
      // 受注マーク [ORDER] があれば除去
      const rawType = log.glass_type ? String(log.glass_type).replace('[ORDER] ', '') : 'Unknown';
      // MATERIAL_DB から表示用ラベルを取得
      const displayLabel = MATERIAL_DB[rawType]?.label || rawType;
      
      return {
        ...log,
        clean_glass_type: rawType,
        display_name: displayLabel
      };
    });
  }, [logs]);

  // 2. 基本KPI
  const kpis = useMemo(() => {
    const totalCount = normalizedLogs.length;
    const uniqueSessions = new Set(normalizedLogs.map(log => log.session_id).filter(Boolean)).size;
    return {
      totalCount,
      uniqueSessions
    };
  }, [normalizedLogs]);

  // 3. 商材（ガラス品種）人気ランキング
  const glassTypeRankings = useMemo(() => {
    const counts: Record<string, { count: number; label: string }> = {};
    normalizedLogs.forEach(log => {
      const type = log.clean_glass_type;
      const label = log.display_name;
      if (!counts[type]) {
        counts[type] = { count: 0, label };
      }
      counts[type].count += 1;
    });

    return Object.keys(counts)
      .map(key => ({
        name: counts[key].label,
        count: counts[key].count
      }))
      .sort((a, b) => b.count - a.count);
  }, [normalizedLogs]);

  const maxGlassCount = useMemo(() => {
    return glassTypeRankings.length > 0 ? glassTypeRankings[0].count : 1;
  }, [glassTypeRankings]);

  // 4. サイズ需要分析 (散布図用データ)
  const scatterData = useMemo(() => {
    const sizeMap = new Map();
    normalizedLogs.forEach(log => {
      const w = Number(log.width_mm);
      const h = Number(log.height_mm);
      if (!w || !h || isNaN(w) || isNaN(h)) return;
      
      const key = `${w}x${h}`;
      if (sizeMap.has(key)) {
        sizeMap.get(key).z += 1;
      } else {
        sizeMap.set(key, { x: w, y: h, z: 1 });
      }
    });
    // 極端に大きいサイズを除外して可読性を高める (3000mm以下)
    return Array.from(sizeMap.values()).filter(d => d.x <= 3000 && d.y <= 3000);
  }, [normalizedLogs]);

  // 5. 最多計算サイズ Top 5
  const topSizes = useMemo(() => {
    const counts: Record<string, number> = {};
    normalizedLogs.forEach(log => {
      const w = Number(log.width_mm);
      const h = Number(log.height_mm);
      if (!w || !h || isNaN(w) || isNaN(h)) return;
      const key = `W${w} × H${h} mm`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.keys(counts)
      .map(key => ({ size: key, count: counts[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [normalizedLogs]);

  // 6. オプション加工の利用状況集計
  const optionStats = useMemo(() => {
    const total = normalizedLogs.length;
    if (total === 0) return [];

    let expressCount = 0;
    let customShapeCount = 0;
    let hasOptionFeeCount = 0;
    let hasFilmCount = 0;

    normalizedLogs.forEach(log => {
      if (log.is_express) expressCount++;
      if (log.shape_type && log.shape_type !== 'RECT') customShapeCount++;
      
      // 特殊オプション料金が発生しているもの (穴あけ、切欠き、R加工など)
      const optFee = Number(log.option_fee) || 0;
      if (optFee > 0) hasOptionFeeCount++;

      // フィルム料金が発生しているもの
      const filmFee = Number(log.film_fee) || 0;
      if (filmFee > 0) hasFilmCount++;
    });

    return [
      { 
        name: '特殊加工（R加工・穴あけ・切欠等）', 
        count: hasOptionFeeCount, 
        ratio: (hasOptionFeeCount / total) * 100, 
        color: '#f59e0b', 
        description: 'option_fee > 0 (ガラス切板以外の加工ニーズ)' 
      },
      { 
        name: '飛散防止フィルム', 
        count: hasFilmCount, 
        ratio: (hasFilmCount / total) * 100, 
        color: '#10b981', 
        description: 'film_fee > 0 (安全性付加オプション)' 
      },
      { 
        name: '特急便オーダー', 
        count: expressCount, 
        ratio: (expressCount / total) * 100, 
        color: '#ec4899', 
        description: 'is_express === true (短納期ニーズ)' 
      },
      { 
        name: '異形形状（円形・R天丸・台形等）', 
        count: customShapeCount, 
        ratio: (customShapeCount / total) * 100, 
        color: '#8b5cf6', 
        description: 'shape_type !== RECT (四角形以外の特殊形状)' 
      }
    ];
  }, [normalizedLogs]);

  // Scatter Tooltip Customizer
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e5e7eb', 
          padding: '12px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          color: '#1f2937',
          fontSize: '0.85rem'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>検索されたサイズ</p>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '4px' }}>
            幅: <span style={{ fontWeight: '600' }}>{data.x} mm</span><br />
            高さ: <span style={{ fontWeight: '600' }}>{data.y} mm</span><br />
            計算回数: <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{data.z} 回</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // ----------------------------------------------------
  // Render - 1. ログイン前 UI
  // ----------------------------------------------------
  if (!authenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6', 
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ 
          background: '#ffffff', 
          padding: '40px', 
          borderRadius: '16px', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
          width: '100%', 
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{ 
            background: '#eff6ff', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px auto',
            color: '#2563eb'
          }}>
            <Lock size={32} />
          </div>
          <h2 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '1.5rem', fontWeight: '800' }}>
            glass-calc 管理画面
          </h2>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '0.9rem' }}>
            パスワードを入力してダッシュボードを開きます。
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="パスワード (glass123)" 
              style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                textAlign: 'center'
              }} 
              autoFocus
            />
            <button 
              type="submit" 
              style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                background: '#2563eb', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Render - 2. ログイン後ダッシュボード
  // ----------------------------------------------------
  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh',
      color: '#1f2937'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: '#e0f2fe', 
            padding: '8px', 
            borderRadius: '8px',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center'
          }}>
            <LayoutDashboard size={28} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            見積計算トラッキング分析
          </h1>
        </div>
        <button 
          onClick={fetchData} 
          style={{ 
            padding: '8px 16px', 
            borderRadius: '6px', 
            border: '1px solid #d1d5db', 
            background: 'white', 
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#4b5563',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
        >
          データを更新
        </button>
      </header>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px', 
          flexDirection: 'column',
          gap: '12px' 
        }}>
          <div style={{ 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            animation: 'spin 1s linear infinite' 
          }} />
          <p style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '500' }}>見積履歴データを読み込み中...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ 
              background: '#ffffff', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px' 
            }}>
              <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', color: '#2563eb', display: 'flex' }}>
                <Search size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px' }}>累計計算回数</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>
                  {kpis.totalCount.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280' }}>回</span>
                </div>
              </div>
            </div>

            <div style={{ 
              background: '#ffffff', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px' 
            }}>
              <div style={{ background: '#faf5ff', padding: '14px', borderRadius: '10px', color: '#7c3aed', display: 'flex' }}>
                <Users size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold', marginBottom: '4px' }}>見積セッション数</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>
                  {kpis.uniqueSessions.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280' }}>ユーザー</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout: 商材 ＆ オプション */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px' }}>
            
            {/* 1. Glass Type Rankings */}
            <div style={{ 
              background: '#ffffff', 
              padding: '28px', 
              borderRadius: '16px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ 
                marginTop: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: '#1f2937', 
                fontSize: '1.2rem',
                fontWeight: '700',
                marginBottom: '24px',
                borderBottom: '1px solid #f3f4f6',
                paddingBottom: '14px'
              }}>
                <Package size={22} color="#2563eb" /> 最も計算されている商材（ガラス品種）
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {glassTypeRankings.length === 0 ? (
                  <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>データがありません</p>
                ) : (
                  glassTypeRankings.slice(0, 10).map((item, index) => {
                    const widthPercent = (item.count / maxGlassCount) * 100;
                    return (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          width: '180px', 
                          fontWeight: '600', 
                          color: '#4b5563', 
                          fontSize: '0.85rem', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }} title={item.name}>
                          {item.name}
                        </div>
                        <div style={{ flex: 1, height: '16px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${widthPercent}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', 
                            borderRadius: '8px',
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
                          }} />
                        </div>
                        <div style={{ 
                          width: '60px', 
                          fontWeight: '800', 
                          color: '#111827', 
                          fontSize: '0.9rem',
                          textAlign: 'right' 
                        }}>
                          {item.count} 回
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. Options Usage Rate */}
            <div style={{ 
              background: '#ffffff', 
              padding: '28px', 
              borderRadius: '16px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ 
                marginTop: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: '#1f2937', 
                fontSize: '1.2rem',
                fontWeight: '700',
                marginBottom: '24px',
                borderBottom: '1px solid #f3f4f6',
                paddingBottom: '14px'
              }}>
                <HelpCircle size={22} color="#f59e0b" /> オプション加工は何がどのくらい使われているか
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {optionStats.length === 0 ? (
                  <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>データがありません</p>
                ) : (
                  optionStats.map((item, index) => {
                    return (
                      <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', color: '#374151' }}>
                          <span>{item.name}</span>
                          <span style={{ color: '#111827' }}>{item.count} 回 ({Math.round(item.ratio)}%)</span>
                        </div>
                        <div style={{ flex: 1, height: '12px', background: '#f3f4f6', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${item.ratio}%`, 
                            height: '100%', 
                            background: item.color, 
                            borderRadius: '6px',
                            transition: 'width 0.6s' 
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>
                          ※ {item.description}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Grid Layout: サイズ分布 ＆ Top 5サイズリスト */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px' }}>
            
            {/* 3. Size Heatmap (Scatter Chart) */}
            <div style={{ 
              background: '#ffffff', 
              padding: '28px', 
              borderRadius: '16px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ 
                marginTop: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: '#1f2937', 
                fontSize: '1.2rem',
                fontWeight: '700',
                marginBottom: '10px',
              }}>
                <TrendingUp size={22} color="#ec4899" /> 計算サイズ分布（需要スポット）
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>
                ※ 縦軸が「高さ」、横軸が「幅」を mm 単位で表します。丸が大きいほど検索回数が多く、需要が集中しています。
              </p>

              <div style={{ width: '100%', height: '320px', backgroundColor: '#fcfdfd', borderRadius: '8px', border: '1px solid #f0f3f6' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.5} stroke="#e5e7eb" />
                    <XAxis type="number" dataKey="x" name="幅" unit="mm" domain={[0, 'dataMax + 100']} stroke="#9ca3af" fontSize={11} />
                    <YAxis type="number" dataKey="y" name="高さ" unit="mm" domain={[0, 'dataMax + 100']} stroke="#9ca3af" fontSize={11} />
                    <ZAxis type="number" dataKey="z" range={[40, 300]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="検索サイズ" data={scatterData} fill="#3b82f6" fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Top 5 Sizes list */}
            <div style={{ 
              background: '#ffffff', 
              padding: '28px', 
              borderRadius: '16px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ 
                marginTop: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: '#1f2937', 
                fontSize: '1.2rem',
                fontWeight: '700',
                marginBottom: '24px',
                borderBottom: '1px solid #f3f4f6',
                paddingBottom: '14px'
              }}>
                <Target size={22} color="#10b981" /> よく計算されるサイズ寸法 Top 5
              </h3>
              
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    <th style={{ padding: '12px 16px' }}>順位</th>
                    <th style={{ padding: '12px 16px' }}>サイズ（幅 × 高さ）</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>計算回数</th>
                  </tr>
                </thead>
                <tbody>
                  {topSizes.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>データがありません</td>
                    </tr>
                  ) : (
                    topSizes.map((item, idx) => {
                      return (
                        <tr key={idx} style={{ 
                          borderBottom: '1px solid #f3f4f6', 
                          fontSize: '0.9rem', 
                          color: '#374151',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '16px', fontWeight: '800', color: idx === 0 ? '#ef4444' : '#6b7280' }}>
                            #{idx + 1}
                          </td>
                          <td style={{ padding: '16px', fontWeight: '600' }}>
                            {item.size}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#111827' }}>
                            {item.count} 回
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Raw Calculation Logs (直近の見積ログ履歴) */}
          <div style={{ 
            background: '#ffffff', 
            padding: '28px', 
            borderRadius: '16px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)', 
            overflowX: 'auto' 
          }}>
            <h3 style={{ 
              marginTop: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              color: '#1f2937', 
              fontSize: '1.2rem',
              fontWeight: '700',
              marginBottom: '24px',
              borderBottom: '1px solid #f3f4f6',
              paddingBottom: '14px'
            }}>
              <Calendar size={22} color="#4b5563" /> 直近の見積ログ履歴（最大15件）
            </h3>
            
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <th style={{ padding: '12px 16px' }}>計算日時</th>
                  <th style={{ padding: '12px 16px' }}>商材種類</th>
                  <th style={{ padding: '12px 16px' }}>サイズ (幅×高)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>ガラス生地代</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>加工オプション費</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>合計計算額</th>
                </tr>
              </thead>
              <tbody>
                {normalizedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>履歴データがありません</td>
                  </tr>
                ) : (
                  normalizedLogs.slice(0, 15).map((log, i) => {
                    const totalOption = (Number(log.edge_fee) || 0) + (Number(log.option_fee) || 0) + (Number(log.film_fee) || 0);
                    return (
                      <tr key={log.id || i} style={{ 
                        borderBottom: '1px solid #f3f4f6', 
                        color: '#374151',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#6b7280' }}>
                          {log.created_at ? new Date(log.created_at).toLocaleString('ja-JP') : '不明'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {log.display_name} ({log.thickness}mm)
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                          {log.width_mm} × {log.height_mm} mm 
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '0.75rem', 
                            color: '#9ca3af',
                            background: '#f3f4f6',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {log.shape_type}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>
                          ¥{(Number(log.glass_cost) || 0).toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '14px 16px', 
                          textAlign: 'right', 
                          fontSize: '0.85rem', 
                          color: totalOption > 0 ? '#e056fd' : '#9ca3af',
                          fontWeight: '600'
                        }}>
                          ¥{totalOption.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '14px 16px', 
                          textAlign: 'right', 
                          fontWeight: '800', 
                          fontSize: '0.95rem', 
                          color: '#2563eb' 
                        }}>
                          ¥{(Number(log.total_fee) || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}
