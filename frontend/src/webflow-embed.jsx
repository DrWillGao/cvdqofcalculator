import React from 'react';
import { createRoot } from 'react-dom/client';
import QofAnalysisTool from './App';

// Create our global namespace
const QofCalculatorNamespace = {
  init: null,
  Component: null
};

class QofCalculatorWrapper extends React.Component {
  render() {
    return (
      <div className="qof-calculator-webflow-container" style={{ isolation: 'isolate' }}>
        <QofAnalysisTool />
      </div>
    );
  }
}

// Initialize function that will be called from Webflow
function initQofCalculator(containerId) {
  // Ensure we're in a browser environment
  if (typeof window === 'undefined' || !document) {
    console.error('Browser environment not detected');
    return;
  }

  // Wait for React and ReactDOM to be available
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
    console.log('QOF Calculator initialized successfully with React 18');
  } catch (error) {
    console.error('Error initializing QOF Calculator:', error);
  }
}

// Create initialization function
const initialize = () => {
  if (typeof window === 'undefined') return;

  // Create global namespace if it doesn't exist
  window.QofCalculatorNamespace = window.QofCalculatorNamespace || {};
  
  // Assign our functions and components
  window.QofCalculatorNamespace.init = initQofCalculator;
  window.QofCalculatorNamespace.Component = QofCalculatorWrapper;
  
  // Also expose directly on window for backwards compatibility
  window.initQofCalculator = initQofCalculator;
  window.QofCalculator = QofCalculatorWrapper;
  
  // Add a ready state flag
  window.QofCalculatorNamespace.isReady = true;
  
  // Dispatch a custom event when ready
  const readyEvent = new CustomEvent('qofCalculatorReady');
  window.dispatchEvent(readyEvent);
  
  console.log('QOF Calculator library loaded successfully');
};

// Run initialization when the script loads
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}

export { QofCalculatorWrapper as QofCalculator, initQofCalculator }; 