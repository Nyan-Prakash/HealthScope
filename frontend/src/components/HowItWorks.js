import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './HowItWorks.css'; // Import custom CSS for styling
import bg from './bg.png'; // Import the background image

const HowItWorks = () => {
  return (
    <div>
      
      <main className="main-content">
        <section
          className="intro-section"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <h2 className="intro-title">How it Works</h2>
          <p className="intro-text">
            This is an explaination of the Data Science and Machine Learning behind HealthScope.
          </p>
          <br />
          {/* Flexbox Container for Buttons */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center' }}>
            {/* Use Link component to navigate to the new page */}
            <Link to="/" className="scroll-link-New">
              Go Back Home
            </Link>
          </div>
        </section>
        </main>











      <section className="data-section">
        <h2>Data Collection</h2>
        <p>
          HealthScope collects data from various reputable sources, including public health databases, medical research, and real-time health monitoring systems.
          Our comprehensive dataset is meticulously cleaned, preprocessed, and normalized to maintain high accuracy and reliability.
        </p>
      </section>

      <section className="model-section">
        <h2>Our CNN Model</h2>
        <p>
          Our platform utilizes a Convolutional Neural Network (CNN) to analyze and interpret complex health data. Initially developed for image recognition, CNNs are also highly effective for identifying patterns in health datasets.
          As the model processes data through multiple layers, it learns and enhances its predictive capabilities over time, offering accurate insights.
        </p>
      </section>

      <section className="usage-section">
        <h2>Using HealthScope</h2>
        <div className="steps">
          <div className="step">
            <h3>Step 1</h3>
            <p>Select a region on the interactive map.</p>
          </div>
          <div className="step">
            <h3>Step 2</h3>
            <p>Explore visualized health data and trends for the selected area.</p>
          </div>
          <div className="step">
            <h3>Step 3</h3>
            <p>Leverage insights to make informed health decisions.</p>
          </div>
        </div>
      </section>

      {/* Back to Home Button */}

    </div>
  );
};

export default HowItWorks;
