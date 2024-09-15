import React from 'react';
import './Sidepanel.css'; // Import the CSS for animations

const SidePanel = ({ isOpen, onClose, data }) => {
  return (
    <div className={`side-panel ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
      <h2>Data Details</h2>
      {data ? (
        <div className="data-content">
          <p><strong>Health Score:</strong> {data.healthScore}</p>
          <p><strong>Arth:</strong> {data.arth}</p>
          {/* Add more data as needed */}
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default SidePanel;
