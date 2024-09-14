// src/components/MapView.jsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
// src/components/MapView.jsx
import axios from '../services/api';  // Ensure this path is correct
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoid29sZm1hbjUiLCJhIjoiY20xMWl3aW5iMDNzaTJyb2lhMWI5MzBnaSJ9.eDVXFDM_gOY1J4k_YHJMsg'; // Replace with your Mapbox access token

const MapView = ({ filters }) => {
  const mapContainerRef = useRef(null); // Ref to store the map container DOM node

  useEffect(() => {
    // Initialize the map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current, // Specify the container ID
      style: 'mapbox://styles/mapbox/streets-v11', // Mapbox style URL
      center: [-122.4194, 37.7749], // Initial map center [longitude, latitude]
      zoom: 10, // Initial zoom level
    });

    // Fetch health data when the map is loaded
    map.on('load', () => {
      axios
        .get('/health-data', { params: filters }) // Fetch health data from FastAPI backend
        .then((response) => {
          const healthData = response.data;

          // Add a GeoJSON source for health data
          map.addSource('health-data', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: healthData.map((point) => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [point.longitude, point.latitude], // Use longitude and latitude for point locations
                },
                properties: {
                  healthScore: point.healthScore, // Use health score for styling
                },
              })),
            },
          });

          // Add a heatmap layer for visualizing the health data
          map.addLayer({
            id: 'health-heatmap',
            type: 'heatmap',
            source: 'health-data',
            maxzoom: 15,
            paint: {
              // Color ramp for heatmap based on health score
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'healthScore'], 0, 0, 100, 1],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 0, 255, 0)', // Blue for low density
                0.5, 'rgba(0, 255, 0, 0.5)', // Green for medium density
                1, 'rgba(255, 0, 0, 1)', // Red for high density
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20], // Radius of the heatmap points
              'heatmap-opacity': 0.8, // Opacity of the heatmap
            },
          });
        })
        .catch((error) => {
          console.error('Error fetching health data:', error); // Handle errors in data fetching
        });
    });

    // Clean up the map instance when the component is unmounted
    return () => map.remove();
  }, [filters]); // Re-run the effect if filters change

  return (
    // Map container where the map will be rendered
    <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
  );
};

export default MapView;
