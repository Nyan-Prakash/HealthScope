import React from 'react';
import './Sidepanel.css'; // Import the CSS for animations
import { LineChart } from '@mui/x-charts/LineChart';

const SidePanel = ({ isOpen, onClose, data, graphData, xset, yset }) => {
  // Check if xset has at least 3 points
  const isChartDataValid = xset && xset.length >= 3;

  // Set panel height based on whether the chart is displayed
  const panelHeight = isChartDataValid ? '400px' : '200px'; // Adjust these values as needed

  return (
    <div
      className={`side-panel ${isOpen ? 'open' : ''}`}
      style={{ height: panelHeight }} // Apply the dynamic height
    >
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
          {isChartDataValid && (
            <div>
              <LineChart
                xAxis={[{ data: xset }]} // Use xset for x-axis data
                series={[{ data: yset }]} // Use yset for y-axis data
                width={500}
                height={300}
              />
            </div>
          )}
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default SidePanel;
