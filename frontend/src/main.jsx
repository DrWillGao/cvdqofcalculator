import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemberstackProvider } from '@memberstack/react';
import App from './App';
import './index.css';

// Add error boundary for development
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Ensure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}

// Mount the React application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <MemberstackProvider config={{
        publicKey: "pk_ee6f53213efb037d10aa",
      }}>
        <App />
      </MemberstackProvider>
    </ErrorBoundary>
  </React.StrictMode>
); 