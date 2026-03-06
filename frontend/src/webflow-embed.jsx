import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

class QofCalculatorWrapper extends React.Component {
  render() {
    return (
      <div className="qof-calculator-webflow-container" style={{ isolation: 'isolate' }}>
        <App />
      </div>
    );
  }
}

function initQofCalculator(containerId) {
  if (typeof window === 'undefined' || !document) {
    console.error('Browser environment not detected');
    return;
  }

  if (!window.React || !window.ReactDOM) {
    console.error('React or ReactDOM not loaded');
    return;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found`);
    return;
  }

  try {
    const root = createRoot(container);
    root.render(<QofCalculatorWrapper />);
  } catch (error) {
    console.error('Error initializing QOF Calculator:', error);
  }
}

const initialize = () => {
  if (typeof window === 'undefined') return;

  window.QofCalculatorNamespace = window.QofCalculatorNamespace || {};
  window.QofCalculatorNamespace.init = initQofCalculator;
  window.QofCalculatorNamespace.Component = QofCalculatorWrapper;
  window.initQofCalculator = initQofCalculator;
  window.QofCalculator = QofCalculatorWrapper;
  window.QofCalculatorNamespace.isReady = true;

  const readyEvent = new CustomEvent('qofCalculatorReady');
  window.dispatchEvent(readyEvent);
};

if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}

export { QofCalculatorWrapper as QofCalculator, initQofCalculator };
