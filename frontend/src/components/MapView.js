import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from '../services/api'; // Import your configured Axios instance
import 'mapbox-gl/dist/mapbox-gl.css'; // Import the Mapbox CSS
import Slider from '@mui/material/Slider'; // Import Material UI Slider component
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import Material UI arrow icon

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoid29sZm1hbjUiLCJhIjoiY20xMWl3aW5iMDNzaTJyb2lhMWI5MzBnaSJ9.eDVXFDM_gOY1J4k_YHJMsg'; // Replace with your Mapbox access token

const MapView = () => {
  const mapContainerRef = useRef(null); // Ref to store the map container DOM node
  const [year, setYear] = useState(2024); // State to store the year
  const [map, setMap] = useState(null); // State to store the map instance
  const [center, setCenter] = useState([-76.61, 39.29]); // State to store map center (lng, lat)
  const [zoom, setZoom] = useState(10); // State to store map zoom level

  useEffect(() => {
    // Initialize the map
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current, // Specify the container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Mapbox style URL
        center: center, // Use stored center
        zoom: zoom, // Use stored zoom level
      });

      mapInstance.on('load', () => {
        setMap(mapInstance); // Store the map instance in state
        fetchAndDisplayData(mapInstance, year); // Fetch data when the map loads
      });

      mapInstance.on('moveend', () => {
        // Update center and zoom state when map movement ends
        setCenter([mapInstance.getCenter().lng, mapInstance.getCenter().lat]);
        setZoom(mapInstance.getZoom());
      });

      return mapInstance;
    };

    const mapInstance = initializeMap();

    return () => mapInstance.remove(); // Clean up the map instance when the component is unmounted
  }, [year]); // Re-run the effect if the year changes

  const fetchAndDisplayData = (mapInstance, year) => {
    // Create a FormData object to send to the backend
    const formData = new FormData();
    formData.append('year', year);

    // Fetch data from the backend
    axios
      .post('/display-all-longandlat', formData)
      .then((response) => {
        const healthData = response.data; // Assume response data is an array of points

        console.log(healthData); // Debugging: log the fetched data

        const healthDataMap = healthData.map((point) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.Latitude, point.Longitude], // Use longitude and latitude for point locations
          },
          properties: {
            healthScore: point.Normalized_Health_Score, // Use health score for styling
          },
        }));

        if (mapInstance.getSource('health-data')) {
          mapInstance.getSource('health-data').setData({
            type: 'FeatureCollection',
            features: healthDataMap,
          });
        } else {
          // Add GeoJSON source
          mapInstance.addSource('health-data', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: healthDataMap,
            },
          });

          // Add heatmap layer
          mapInstance.addLayer({
            id: 'health-heatmap',
            type: 'heatmap',
            source: 'health-data',
            maxzoom: 15,
            paint: {
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'healthScore'], 0, 0, 100, 1],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['get', 'healthScore'],
                0, 'rgba(255, 255, 255, 0)', // Transparent at health score 0
                100, 'rgba(255, 0, 0, 1)', // Fully red at health score 100
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
              'heatmap-opacity': 0.8,
            },
          });

          // Add a circle layer for points
          mapInstance.addLayer({
            id: 'health-points',
            type: 'circle',
            source: 'health-data',
            minzoom: 5,
            paint: {
              // Increase the size of the circle points based on health score
              'circle-radius': ['interpolate', ['linear'], ['get', 'healthScore'], 0, 8, 100, 24],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'healthScore'],
                0, 'rgba(255, 255, 255, 0)', // Transparent at health score 0
                100, 'rgba(255, 0, 0, 0.5)', // Semi-transparent red at health score 100
              ],
              'circle-stroke-color': [
                'interpolate',
                ['linear'],
                ['get', 'healthScore'],
                0, 'rgba(255, 255, 255, 0)', // Transparent at health score 0
                100, 'rgba(255, 0, 0, 1)', // Fully red at health score 100
              ],
              'circle-stroke-width': 2,
              'circle-opacity': 0.5,
            },
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching data from neural-network-response:', error);
      });
  };

  const handleSliderChange = (event, newValue) => {
    setYear(newValue); // Update the year state when the slider changes
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0 }}>
      {/* Back to Top Arrow */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
