import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#e2e8f0', background: '#020617', height: '100vh', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f87171' }}>System Crash</h1>
            <p style={{ marginBottom: '1rem' }}>The operating system encountered a critical error during startup.</p>
            <pre style={{ color: '#fca5a5', background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', marginBottom: '1.5rem', border: '1px solid #334155' }}>
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }} 
              style={{ padding: '0.75rem 1.5rem', background: '#06b6d4', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#0891b2'}
              onMouseOut={(e) => e.currentTarget.style.background = '#06b6d4'}
            >
               Factory Reset & Restart
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);