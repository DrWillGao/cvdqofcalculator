import React from 'react';
import ReactDOM from 'react-dom';
import QofAnalysisTool from './App';

// Create our global namespace
const QofCalculatorNamespace = {
  init: null,
  Component: null
};

class QofCalculatorWrapper extends React.Component {
  render() {
    return (
      <div className="webflow-container">
        <QofAnalysisTool />
      </div>
    );
  }
}

// Initialize function that will be called from Webflow
function initQofCalculator(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id ${containerId} not found`);
    return;
  }
  
  try {
    ReactDOM.render(<QofCalculatorWrapper />, container);
    console.log('QOF Calculator initialized successfully');
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
  
  console.log('QOF Calculator library loaded successfully');
};

// Run initialization
initialize();

export { QofCalculatorWrapper as QofCalculator, initQofCalculator }; 