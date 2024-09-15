import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from '../services/api'; // Import your configured Axios instance
import 'mapbox-gl/dist/mapbox-gl.css'; // Import the Mapbox CSS
import Slider from '@mui/material/Slider'; // Import Material UI Slider component
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Import Material UI arrow icon
import SidePanel from './Sidepanel.js';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoid29sZm1hbjUiLCJhIjoiY20xMWl3aW5iMDNzaTJyb2lhMWI5MzBnaSJ9.eDVXFDM_gOY1J4k_YHJMsg'; // Replace with your Mapbox access token

const MapView = () => {
  const mapContainerRef = useRef(null);
  const [year, setYear] = useState(2024);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState([-76.61, 39.29]);
  const [zoom, setZoom] = useState(10);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [GraphData, setGraphData] = useState(null);

  const [xData, setXData] = useState([]);
  const [yData, setYData] = useState([]);

  useEffect(() => {
    // Initialize the map
    const initializeMap = () => {
      closeSidePanel(); // Close the side panel when the map is initialized
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

          const colorStops =
          year < 2024
            ? [
              'interpolate',
              ['linear'],
              ['get', 'healthScore'],
              0, 'rgba(0, 256, 0, 1)', // Blue for healthScore 0
              30, 'rgba(0, 255, 0, 1)',
              60, 'rgba(255, 0, 0, 1)', // Yellow for healthScore 50
              100, 'rgba(255, 0, 0, 1)',] // Red for healthScore 100
            : [
              'interpolate',
              ['linear'],
              ['get', 'healthScore'],
              36, 'rgba(0, 0, 255, 1)', // Blue
              37, 'rgba(0, 128, 0, 1)', // Dark Green
              38, 'rgba(0, 255, 0, 1)', // Green
              39, 'rgba(128, 255, 0, 1)', // Light Green
              40, 'rgba(255, 255, 0, 1)', // Yellow
              41, 'rgba(255, 128, 0, 1)', // Orange
              42, 'rgba(255, 0, 0, 1)', // Red
              // Adjust based on minScore and maxScore if necessary
            ]; // Red for healthScore 100
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
  
          // Add a circle layer for points
          mapInstance.addLayer({
            id: 'health-points',
            type: 'circle',
            source: 'health-data',
            minzoom: 12,
            paint: {
              // Increase the size of the circle points based on health score
              'circle-radius': ['interpolate', ['linear'], ['get', 'healthScore'], 0, 15, 100, 16],
              'circle-color': colorStops,
              'circle-stroke-color': colorStops,
              'circle-stroke-width': 2,
              'circle-opacity': 0.5,
            },
          });
  
          // Add click event listener for the health-points layer
          // Add click event listener for the health-points layer
          mapInstance.on('click', 'health-points', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            let healthScore = e.features[0].properties.healthScore;
            const formData = new FormData();
            formData.append('Longitude', coordinates[0]);
            formData.append('Latitude', coordinates[1]);
            formData.append('year', year);
            
            // Round the health score to the nearest integer
            healthScore = Math.round(healthScore);
          
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            if(year < 2024)
            {
              axios.post('/graph-health-score', formData)
  .then((response) => {
    const responseData = response.data;

    // Create two variables for the x and y values
    const xValues = responseData.years || [];  // X values for the line chart (years)
    const yValues = responseData.health_scores || [];  // Y values for the line chart (health scores)

    setXData(xValues);
    setYData(yValues);


    console.log(xValues);
    // Create a new object to map the response data
    const mappedData = {
      years: xValues,  // X values
      health_scores: yValues,  // Y values
    };

    // Set the mapped data to be used in the SidePanel
    setGraphData(mappedData);
  })
  .catch((error) => {
    console.error('Error fetching graph data:', error);
  });


            // Make the asynchronous request to get additional data
            axios.post('/health-information', formData)
  .then((response) => {
    // Map API response data to your custom labels
    const responseData = response.data[0];
    setSelectedData(responseData);
    

    // Map the response data to your custom labels
    const customData = {
      'Health Score': healthScore, 
      'Diabetes': responseData.DIABETES_CrudePrev, 
      'Cancer': responseData.CANCER_CrudePrev,
      'Obesity': responseData.OBESITY_CrudePrev,
      'Cholesterol': responseData.HIGHCHOL_CrudePrev,
      'Stroke': responseData.STROKE_CrudePrev,
      'Sleep Quality': responseData.SLEEP_CrudePrev,
      'Blood Pressure': responseData.BPMED_CrudePrev
      // Add more custom labels and corresponding data here
    };

    setSelectedData(customData); // Set selected data with custom labels
    setSidePanelOpen(true); // Open side panel
  })
  .catch((error) => {
    console.error('Error fetching additional data:', error);
  });
            } else {
              const popup = new mapboxgl.Popup({ closeOnClick: true })
              .setLngLat(coordinates) // Set the popup at the clicked point
              .setHTML(`<strong>Health Score</strong><p>${healthScore}</p>`)
              .addTo(mapInstance);
          }            

          });
          

  
          // Change the cursor to a pointer when the mouse is over the health-points layer
          mapInstance.on('mouseenter', 'health-points', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
  
          // Change the cursor back to default when it leaves the health-points layer
          mapInstance.on('mouseleave', 'health-points', () => {
            mapInstance.getCanvas().style.cursor = '';
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching data from neural-network-response:', error);
      });
  };
  const closeSidePanel = () => {
    setSidePanelOpen(false);
  };

  const handleSliderChange = (event, newValue) => {
    setYear(newValue); // Update the year state when the slider changes
  };

  const zoomIn = () => {
    if (map) map.zoomIn();
  };

  const zoomOut = () => {
    if (map) map.zoomOut();
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0 }}>
      {/* Zoom In and Out Buttons */}
      <SidePanel isOpen={sidePanelOpen} onClose={closeSidePanel} data={selectedData} graphDatas={GraphData} xset={xData} yset={yData} />

      <div style={{ position: 'absolute', top: '80px', left: '10px', zIndex: 1 }}>
        <button
          onClick={zoomIn}
          style={{
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '10px', // Rounded corners
            marginBottom: '10px', // Spacing between buttons
            cursor: 'pointer',
            width: '40px', // Consistent width
            height: '40px', // Consistent height
            fontSize: '20px', // Larger font size for the icon
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Softer shadow
            transition: 'background-color 0.3s ease', // Smooth hover transition
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
        >
          +
        </button>
        <button
          onClick={zoomOut}
          style={{
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '10px', // Rounded corners
            cursor: 'pointer',
            width: '40px', // Consistent width
            height: '40px', // Consistent height
            fontSize: '20px', // Larger font size for the icon
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Softer shadow
            transition: 'background-color 0.3s ease', // Smooth hover transition
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
        >
          -
        </button>
      </div>

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
          max={2029}
          marks
          color="primary"
        />
      </div>

      {/* Banner */}
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

      {/* Map Container */}
      <div ref={mapContainerRef} className="map-container" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapView;
 