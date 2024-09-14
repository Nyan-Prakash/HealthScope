// src/components/MapView.jsx
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from '../services/api'; // Ensure axios instance is correctly imported
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoid29sZm1hbjUiLCJhIjoiY20xMWl3aW5iMDNzaTJyb2lhMWI5MzBnaSJ9.eDVXFDM_gOY1J4k_YHJMsg'; // Replace with your Mapbox access token

const MapView = () => {
  const mapContainerRef = useRef(null); // Ref to store the map container DOM node
  const [year, setYear] = useState(2024); // State to store the year (modify as needed)
  const [mapCenter, setMapCenter] = useState([-122.4194, 37.7749]); // Initial center coordinates
  const [map, setMap] = useState(null); // State to store the map instance

  useEffect(() => {
    // Initialize the map
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current, // Specify the container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Mapbox style URL
        center: mapCenter, // Initial map center [longitude, latitude]
        zoom: 10, // Initial zoom level
      });

      mapInstance.on('load', () => {
        setMap(mapInstance); // Store the map instance in state
        fetchAndDisplayData(mapInstance.getCenter().lng, mapInstance.getCenter().lat, year);
      });

      // Listen for changes to the map center
      mapInstance.on('moveend', () => {
        const center = mapInstance.getCenter(); // Get current center of the map
        setMapCenter([center.lng, center.lat]); // Update map center state
        fetchAndDisplayData(center.lng, center.lat, year); // Fetch data from the backend
      });

      return mapInstance;
    };

    // Initialize the map on component mount
    const mapInstance = initializeMap();

    // Clean up the map instance when the component is unmounted
    return () => mapInstance.remove();
  }, []); // Only run once on component mount

  // Function to fetch data from the backend and display on the map
  const fetchAndDisplayData = (longitude, latitude, date) => {
    // Create a FormData object
    const formData = new FormData();
    formData.append('longitude', longitude);
    formData.append('latitude', latitude);
    formData.append('date', date);

    // Send the FormData to the backend using axios
    axios
      .post('/neural-network-response', formData)
      .then((response) => {
        const healthData = response.data;

        // Create a GeoJSON source for the fetched health data
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
              properties: {
                healthScore: point.healthScore,
              },
            })),
          },
        };

        // Add or update the GeoJSON source
        if (map.getSource('health-data')) {
          map.getSource('health-data').setData(geojsonSource.data); // Update existing source
        } else {
          map.addSource('health-data', geojsonSource); // Add new source
          
          // Add a heatmap layer for visualizing the health data
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
                0, 'rgba(0, 0, 255, 0)', // Blue for very low density
                0.2, 'rgba(255, 165, 0, 0.6)', // Orange for medium density
                0.4, 'rgba(255, 140, 0, 0.6)', // Darker orange for higher density
                0.6, 'rgba(255, 69, 0, 0.6)', // Red-orange for higher density
                1, 'rgba(255, 0, 0, 1)', // Red for high density
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
              'heatmap-opacity': 0.8,
            },
          });

          // Add circle layer for individual points with varying sizes and colors
          map.addLayer({
            id: 'health-points',
            type: 'circle',
            source: 'health-data',
            minzoom: 5,
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'healthScore'],
                0, 4, // Smallest size for low score
                100, 12, // Largest size for high score
              ],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'healthScore'],
                0, 'rgba(255, 0, 0, 0.5)', // Red for low health score (semi-transparent)
                50, 'rgba(255, 165, 0, 0.5)', // Orange for medium health score (semi-transparent)
                100, 'rgba(0, 255, 0, 0.5)', // Green for high health score (semi-transparent)
              ],
              'circle-stroke-color': [
                'interpolate',
                ['linear'],
                ['get', 'healthScore'],
                0, 'rgba(255, 0, 0, 1)', // Red for low health score (opaque)
                50, 'rgba(255, 165, 0, 1)', // Orange for medium health score (opaque)
                100, 'rgba(0, 255, 0, 1)', // Green for high health score (opaque)
              ],
              'circle-stroke-width': 2,
              'circle-stroke-opacity': 1,
              'circle-opacity': 0.5,
            },
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching data from neuralnetwork-response:', error);
      });
  };

  return (
    // Map container where the map will be rendered
    <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
  );
};

export default MapView;
