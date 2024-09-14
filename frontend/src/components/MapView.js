import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from '../services/api'; // Ensure axios instance is correctly imported
import 'mapbox-gl/dist/mapbox-gl.css'; // Import the Mapbox CSS
import '../App.css'; // Import custom CSS if needed
import Slider from '@mui/material/Slider'; // Import Material UI Slider component
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import Material UI arrow icon

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoid29sZm1hbjUiLCJhIjoiY20xMWl3aW5iMDNzaTJyb2lhMWI5MzBnaSJ9.eDVXFDM_gOY1J4k_YHJMsg'; // Replace with your Mapbox access token

const MapView = () => {
  const mapContainerRef = useRef(null); // Ref to store the map container DOM node
  const [year, setYear] = useState(2024); // State to store the year
  const [mapCenter, setMapCenter] = useState([-122.4194, 37.7749]); // Initial center coordinates
  const [map, setMap] = useState(null); // State to store the map instance

  useEffect(() => {
    // Initialize the map
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current, // Specify the container ID
        style: 'mapbox://styles/wolfman5/cm12gbei7004x01pc3rjz2sbf', // Mapbox style URL
        center: mapCenter, // Initial map center [longitude, latitude]
        zoom: 10, // Initial zoom level
      });

      mapInstance.on('load', () => {
        setMap(mapInstance); // Store the map instance in state
        fetchAndDisplayData(mapInstance.getCenter().lng, mapInstance.getCenter().lat, year);
      });

      mapInstance.on('moveend', () => {
        const center = mapInstance.getCenter(); // Get current center of the map
        setMapCenter([center.lng, center.lat]); // Update map center state
        fetchAndDisplayData(center.lng, center.lat, year); // Fetch data from the backend
      });

      return mapInstance;
    };

    const mapInstance = initializeMap();

    return () => mapInstance.remove(); // Clean up the map instance when the component is unmounted
  }, [year]); // Re-run the effect if the year changes

  const fetchAndDisplayData = (longitude, latitude, year) => {
    const formData = new FormData();
    formData.append('longitude', longitude);
    formData.append('latitude', latitude);
    formData.append('year', year);

    axios
      .post('/display-all-longandlat', formData)
      .then((response) => {
        const healthData = response.data;

        const geojsonSource = {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: healthData.map((point) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [point.longitude, point.latitude],
              },
              
            })),
          },
        };

        if (map.getSource('health-data')) {
          map.getSource('health-data').setData(geojsonSource.data);
        } else {
          map.addSource('health-data', geojsonSource);

          map.addLayer({
            id: 'health-heatmap',
            type: 'heatmap',
            source: 'health-data',
            maxzoom: 15,
            paint: {
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'healthScore'], 0, 0, 100, 1],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 0, 255, 0)',
                0.2, 'rgba(255, 165, 0, 0.6)',
                0.4, 'rgba(255, 140, 0, 0.6)',
                0.6, 'rgba(255, 69, 0, 0.6)',
                1, 'rgba(255, 0, 0, 1)',
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
              'heatmap-opacity': 0.8,
            },
          });

          map.addLayer({
            id: 'health-points',
            type: 'circle',
            source: 'health-data',
            minzoom: 5,
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['get', 'healthScore'], 0, 4, 100, 12],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'healthScore'],
                0, 'rgba(255, 0, 0, 0.5)',
                50, 'rgba(255, 165, 0, 0.5)',
                100, 'rgba(0, 255, 0, 0.5)',
              ],
              'circle-stroke-color': [
                'interpolate',
                ['linear'],
                ['get', 'healthScore'],
                0, 'rgba(255, 0, 0, 1)',
                50, 'rgba(255, 165, 0, 1)',
                100, 'rgba(0, 255, 0, 1)',
              ],
              'circle-stroke-width': 2,
              'circle-stroke-opacity': 1,
              'circle-opacity': 0.5,
            },
          });

          map.on('click', 'health-points', (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['health-points'] });
            if (features.length) {
              const feature = features[0];
              new mapboxgl.Popup()
                .setLngLat(feature.geometry.coordinates)
                .setHTML(`<h3>Health Score: ${feature.properties.healthScore}</h3>`)
                .addTo(map);
            }
          });

          map.on('mouseenter', 'health-points', () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          map.on('mouseleave', 'health-points', () => {
            map.getCanvas().style.cursor = '';
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching data from FastAPI:', error);
      });
  };

  const handleSliderChange = (event, newValue) => {
    setYear(newValue); // Update the year state when the slider changes
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0 }}>
      {/* Back to Top Arrow */}
      <button
        onClick={scrollToTop}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1,
          backgroundColor: '#fff',
          border: 'none',
          borderRadius: '50%',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        }}
      >
        <ArrowUpwardIcon />
      </button>

      {/* Improved Banner in the Top Right */}
      <div
        className="banner"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#ffffff',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          maxWidth: '250px',
        }}
      >
        <h1 style={{ fontSize: '30px', margin: '0 0 10px 0' }}>HealthScope</h1>
        <p style={{ fontSize: '10px', margin: 0 }}>
          Scroll through the timeline to see how health risk factors have changed over time.
        </p>
      </div>

      {/* Year Slider */}
      <div
        className="slider-container"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}
      >
        <Slider
          value={year}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          step={1}
          min={2016}
          max={2024}
          marks
          color="primary"
        />
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="map-container" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapView;
