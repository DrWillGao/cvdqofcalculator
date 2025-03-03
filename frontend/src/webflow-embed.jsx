import React from 'react';
import ReactDOM from 'react-dom';
import QofAnalysisTool from './App';

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

// Ensure we're in a browser environment
if (typeof window !== 'undefined') {
  // Expose the initialization function globally
  window.initQofCalculator = initQofCalculator;
  
  // Also expose the component itself
  window.QofCalculator = QofCalculatorWrapper;
}

export { QofCalculatorWrapper as QofCalculator, initQofCalculator }; 