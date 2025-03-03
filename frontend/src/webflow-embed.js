import React from 'react';
import ReactDOM from 'react-dom';
import QofAnalysisTool from './App';

// Create a simpler version for Webflow
const QofCalculator = () => {
  return (
    <div className="webflow-container">
      <QofAnalysisTool />
    </div>
  );
};

// Make it available globally
window.QofCalculator = QofCalculator; 