// src/components/MapView.jsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoid29sZm1hbjUiLCJhIjoiY20xMWl3aW5iMDNzaTJyb2lhMWI5MzBnaSJ9.eDVXFDM_gOY1J4k_YHJMsg'; // Replace with your Mapbox access token

const MapView = () => {
  const mapContainerRef = useRef(null); // Ref to store the map container DOM node

  useEffect(() => {
    // Initialize the map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current, // Specify the container ID
      style: 'mapbox://styles/mapbox/streets-v11', // Mapbox style URL
      center: [-122.4194, 37.7749], // Initial map center [longitude, latitude]
      zoom: 10, // Initial zoom level
    });

    // Example fake health data points
    const fakeHealthData = [
      { locationName: 'Point 1', latitude: 37.7749, longitude: -122.4194, healthScore: 70 },
      { locationName: 'Point 2', latitude: 37.7849, longitude: -122.4094, healthScore: 40 },
      { locationName: 'Point 3', latitude: 37.7649, longitude: -122.4294, healthScore: 90 },
      { locationName: 'Point 4', latitude: 37.7549, longitude: -122.4194, healthScore: 20 },
      { locationName: 'Point 5', latitude: 37.7449, longitude: -122.4394, healthScore: 60 },
      // Add more fake data points as needed
    ];

    map.on('load', () => {
      // Create a GeoJSON source with the fake health data
      map.addSource('health-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fakeHealthData.map((point) => ({
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
    });

    // Clean up the map instance when the component is unmounted
    return () => map.remove();
  }, []); // No dependencies, so this runs only once after the component mounts

  return (
    // Map container where the map will be rendered
    <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
  );
};

export default MapView;
