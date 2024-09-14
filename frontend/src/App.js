import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapView from './components/MapView';
import HowItWorks from './components/HowItWorks'; // Import the new How It Works page
import 'mapbox-gl/dist/mapbox-gl.css'; // Import the Mapbox CSS
import bg from './components/bg.png'; // Import the background image
import gs from './components/gs.png'; // Import the grayscale image
import './App.css'; // Import custom CSS if needed

const Home = () => {
  return (
    <div className="App">
      {/* Main Content */}
      <main className="main-content">
        <section
          className="intro-section"
          style={{
            backgroundImage: `url(${gs})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <h2 className="intro-title">Welcome to HealthScope</h2>
          <p className="intro-text">
            Explore health data visualizations and insights on our interactive map.
          </p>
          <br />
          {/* Flexbox Container for Buttons */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center' }}>
            <a href="#map-section" className="scroll-link">
              Scroll to Map
            </a>
            {/* Use Link component to navigate to the new page */}
            <Link to="/how-it-works" className="scroll-link-New">
              How It Works?
            </Link>
          </div>
        </section>

        {/* Map Section */}
        <section id="map-section" className="map-section">
          <MapView />
        </section>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
    </Router>
  );
};

export default App;
