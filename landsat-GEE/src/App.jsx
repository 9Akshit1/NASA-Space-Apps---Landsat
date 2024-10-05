import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import MapSelector from './components/MapSelector';
import Results from './components/Results'; 
import { findDatasetsInArea } from './utils/datasetSearch';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';   
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const App = () => {
  const [location, setLocation] = useState(null);
  const [datasetGrid, setDatasetGrid] = useState([]); // Store multiple datasets for grid
  const [leadTime, setLeadTime] = useState(10); // Default lead time in minutes
  const [acquisitionInfo, setAcquisitionInfo] = useState([]);
  const [latitude, setLatitude] = useState(''); // State for latitude input
  const [longitude, setLongitude] = useState(''); // State for longitude input
  const [selectedAttribute, setSelectedAttribute] = useState('reflectance'); // Default attribute to display

  const handleLocationSubmit = async (latLng) => {
    try {
      const datasets = await findDatasetsInArea(latLng.lat, latLng.lng);
      if (datasets && datasets.length === 9) {
        setDatasetGrid(datasets);
        setAcquisitionInfo((prev) => [...prev, datasets[4]]); // Store info of the closest dataset (middle of the grid)
        toast.success(`Found datasets, closest Path: ${datasets[4].wrsPath}, Row: ${datasets[4].wrsRow}`);
      } else {
        toast.error("Not enough datasets found for the given location.");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleManualSubmit = async () => {
    if (!latitude || !longitude) {
      toast.error("Please enter both latitude and longitude.");
      return;
    }

    try {
      const latLng = {
        lat: parseFloat(latitude),    //ex: 70.9167
        lng: parseFloat(longitude),   //ex: -49.0009
      };
      await handleLocationSubmit(latLng); // Use the existing function to fetch data
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const calculatePinPosition = (dataset, userLat, userLng) => {
    const upperLeftLat = dataset.cornerUpperLeftLatDMS;
    const upperLeftLng = dataset.cornerUpperLeftLongDMS;
    const lowerRightLat = dataset.cornerLowerRightLatDMS;
    const lowerRightLng = dataset.cornerLowerRightLongDMS;

    const latPercentage = (upperLeftLat - userLat) / (upperLeftLat - lowerRightLat);
    const lngPercentage = (userLng - upperLeftLng) / (lowerRightLng - upperLeftLng);

    return {
      top: `${latPercentage * 100}%`,
      left: `${lngPercentage * 100}%`,
    };
  };

  useEffect(() => {
    if (datasetGrid.length > 0) {
      const closestDataset = datasetGrid[4];
      const acquisitionStart = new Date(closestDataset.acquisitionStartTime);
      const now = new Date("2024-10-01 14:56:01"); 
      const timeUntilPass = (acquisitionStart - now) / 1000 / 60; 

      if (timeUntilPass > leadTime) {
        const notificationTime = timeUntilPass - leadTime;
        const timerId = setTimeout(() => {
          toast.info(
            `Landsat will pass over in ${leadTime} minutes! (Path: ${closestDataset.wrsPath}, Row: ${closestDataset.wrsRow})`
          );
        }, notificationTime * 60 * 1000);

        return () => clearTimeout(timerId);
      } else {
        toast.info(`Landsat is passing over right now!`);
      }
    }
  }, [datasetGrid, leadTime]);

  // Function to prepare chart data based on the selected attribute
  const getChartData = (attribute) => {
    // Check if the attribute is a list (e.g., reflectance with multiple bands)
    const isList = Array.isArray(datasetGrid[0][attribute]);
    
    // Labels for x-axis (Bands for list-type attributes, Datasets for single values)
    const labels = isList
      ? ["Band 1", "Band 2", "Band 3", "Band 4", "Band 5", "Band 6", "Band 7"] // Adjust based on your data
      : datasetGrid.map((_, index) => `Dataset ${index + 1}`);
    
    const datasets = [];
    
    if (datasetGrid.length > 0) {
      // Case: Attribute is a list, plot all datasets on the same graph
      if (isList) {
        datasets.push(
          ...datasetGrid.map((dataset, idx) => ({
            label: `Dataset ${idx + 1} - ${attribute}`,  // Label for each dataset
            data: dataset[attribute],  // Data for each dataset (array of values)
            borderColor: `rgba(${(idx + 1) * 50}, 99, 132, 1)`,  // Different color for each dataset line
            backgroundColor: `rgba(${(idx + 1) * 50}, 99, 132, 0.2)`,  // Optional fill color (transparent)
            fill: false,  // No fill under the line
            tension: 0.1,  // Smooth the line a bit
            pointBackgroundColor: 'rgba(0, 0, 0, 1)',  // Darker points for better visibility
            pointBorderColor: 'rgba(0, 0, 0, 1)',  // Dark border for points
            pointRadius: 5,  // Larger point size for better visibility
          }))
        );
      } 
      // Case: Attribute is a single value, plot points without lines
      else {
        const data = datasetGrid.map((dataset) => dataset[attribute]);
        
        datasets.push({
          label: `${attribute} Comparison`,  // Single comparison label
          data: data,  // Data for all datasets
          borderColor: 'rgba(180, 255, 132, 1)',  // Line color
          backgroundColor: 'rgba(180, 255, 132, 0.2)',  // Fill color (optional)
          fill: false,  // No fill under the line
          showLine: false,  // Do not connect points for single values
          tension: 0.1,
          pointBackgroundColor: 'rgba(180, 255, 132, 1)',  // Darker points
          pointBorderColor: 'rgba(180, 255, 132, 1)',  // Darker border for points
          pointRadius: 5,  // Larger point size for single-value attributes
        });
      }
    }

    return {
      labels: labels,  // X-axis labels (Bands or Dataset numbers)
      datasets: datasets,  // Array of datasets to plot
    };
  };

  // List of attributes that the user can choose from
  const availableAttributes = ['reflectance', 'temperature', 'landCloudCover', 'dayNightIndicator', 'sunElevationL0RA', 'sunAzimuthL0RA', 'dayNightIndicator', 'sensorIdentifier', 'satellite'];

  return (
    <Router>
      <div className="App">
        <h1>Landsat Acquisition Notification</h1>

        <div>
          <h2>Enter Latitude and Longitude</h2>
          <input
            type="text"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
          <input
            type="text"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
          <button onClick={handleManualSubmit}>Submit Coordinates</button>
        </div>

        <MapSelector setLocation={handleLocationSubmit} />

        <div style={{ marginTop: '20px' }}>
          <label>Lead Time (minutes): </label>
          <input
            type="number"
            value={leadTime}
            onChange={(e) => setLeadTime(parseInt(e.target.value))}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <Link to="/results">
            <button disabled={acquisitionInfo.length === 0}>View Acquisition Data</button>
          </Link>
        </div>

        <ToastContainer />

        {datasetGrid.length > 0 && (
          <div>
            <div className="dataset-grid">
              {datasetGrid.map((dataset, index) => (
                <div key={index} className="grid-item zoomable">
                  <img
                    src={dataset.imageUrl}
                    alt={`Scene ${index + 1}`}
                    className={index === 4 ? "middle-image" : ""}
                    style={{ position: 'relative' }}
                  />
                  {index === 4 && latitude && longitude && (
                    <div
                      className="red-pin"
                      style={calculatePinPosition(dataset, parseFloat(latitude), parseFloat(longitude))}
                    >
                      📍
                    </div>
                  )}
                  <p>Path: {dataset.wrsPath}, Row: {dataset.wrsRow}</p>
                  <p>Acquisition Time: {new Date(dataset.acquisitionStartTime).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px' }}>
              <label>Select Attribute: </label>
              <select value={selectedAttribute} onChange={(e) => setSelectedAttribute(e.target.value)}>
                {availableAttributes.map((attr) => (
                  <option key={attr} value={attr}>
                    {attr.charAt(0).toUpperCase() + attr.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="spectral-chart" style={{ marginTop: '30px' }}>
              <Line data={getChartData(selectedAttribute)} />
            </div>
          </div>
        )}
        
        <Routes>
          <Route
            path="/results"
            element={<Results acquisitionInfo={acquisitionInfo} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
