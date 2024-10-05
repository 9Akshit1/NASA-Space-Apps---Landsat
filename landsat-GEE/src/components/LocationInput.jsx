// src/components/LocationInput.jsx
import React, { useState } from 'react';

const LocationInput = ({ onLocationSubmit }) => {
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [placeName, setPlaceName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (placeName) {
            // Convert placeName to lat/lng (you might want to implement this)
            // For now, we will assume it provides lat/lng
            const latLng = { lat: 0, lng: 0 }; // Placeholder
            onLocationSubmit(latLng);
        } else if (latitude && longitude) {
            onLocationSubmit({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Place Name: </label>
                <input
                    type="text"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                />
            </div>
            <div>
                <label>Latitude: </label>
                <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                />
            </div>
            <div>
                <label>Longitude: </label>
                <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default LocationInput;
