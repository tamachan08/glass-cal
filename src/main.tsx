import { Component, StrictMode } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Dashboard from './components/Dashboard.tsx'

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', margin: '40px auto', maxWidth: '800px', fontFamily: 'sans-serif', border: '1px solid #fca5a5' }}>
          <h2 style={{ marginTop: 0 }}>⚠️ 画面の描画中にエラーが発生しました</h2>
          <p>このエラーメッセージをコピーしてAIアシスタントに教えてください：</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #fecaca', color: '#111827', fontWeight: 'bold' }}>
            {this.state.error?.toString()}
          </pre>
          <details style={{ marginTop: '15px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600' }}>エラーのスタックトレースを表示</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', opacity: 0.8, background: '#f9fafb', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ページをリロードする
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
