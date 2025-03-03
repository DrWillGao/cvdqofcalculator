import React from 'react';
import ReactDOM from 'react-dom';
import QofAnalysisTool from './App';

// Create the wrapper component
const QofCalculator = () => {
  return (
    <div className="webflow-container">
      <QofAnalysisTool />
    </div>
  );
};

// Create a function to initialize the calculator
function initQofCalculator(elementId) {
  const container = document.getElementById(elementId);
  if (container) {
    ReactDOM.render(React.createElement(QofCalculator), container);
  }
}

// Expose both the component and init function to window
window.QofCalculator = QofCalculator;
window.initQofCalculator = initQofCalculator;

export { QofCalculator, initQofCalculator }; 