// src/App.js
import React, { useState } from 'react';
import MapView from './components/MapView';
//import PredictionChart from './components/PredictionChart';
//import Filters from './components/Filters';
import './App.css'; // Import custom CSS if needed
//a change
const App = () => {
  // State for managing filters
  

  return (
    <div className="App">
      {/* App Title */}
      <header className="App-header">
        <h1>Not a front for drugs</h1>
      </header>

      {/* Filter Component */
      //<div className="filters-container">
      //<Filters setFilters={setFilters} />
    //</div>
    }
      

      {/* Map View Component */}
       

      {/* Prediction Chart Component
      <div className="chart-container">
        <h2>Predicted Health Data</h2>
        <PredictionChart />
      </div>
       */}
       <MapView></MapView>
    </div>
    
  );
};

export default App;
