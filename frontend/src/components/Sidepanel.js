import React from 'react';
import './Sidepanel.css'; // Import the CSS for animations
import { LineChart } from '@mui/x-charts/LineChart';
import { stepConnectorClasses } from '@mui/material';


const SidePanel = ({ isOpen, onClose, data , graphDatas}) => {
  return (
    <div className={`side-panel ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
      <h2>Data Details</h2>
      {data ? (
        <div className="data-content">
          {/* Dynamically render all data fields */}
          <div className="data-grid">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="data-item">
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </div>
          <div>
      <LineChart
      xAxis={graphDatas.years}

      series={graphDatas.health-stepConnectorClasses}
      width={500}
      height={300}
    />
      </div>

        </div>
      ) : (
        <p>No data available</p>
      )}
      

    </div>
  );
};

export default SidePanel;
