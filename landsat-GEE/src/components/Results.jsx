import React, { useState } from 'react';

const Results = ({ data }) => {
  const [cloudCoverThreshold, setCloudCoverThreshold] = useState(15);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);

  const filteredData = data.filter(item => {
    const cloudCover = parseFloat(item.landCloudCover);
    const acquisitionDate = new Date(item.acquisitionDay);

    // Check if the cloud cover is below the threshold
    const isCloudCoverOk = cloudCover < cloudCoverThreshold;

    // Check if the acquisition date falls within the specified range
    const isDateInRange = (!dateFrom || acquisitionDate >= new Date(dateFrom)) && 
                          (!dateTo || acquisitionDate <= new Date(dateTo));

    return isCloudCoverOk && isDateInRange;
  });

  const sortedData = [...filteredData].sort((a, b) => new Date(a.acquisitionDay) - new Date(b.acquisitionDay));

  const downloadCSV = () => {
    const csvRows = [];
    const headers = [
      'wrsPath',
      'wrsRow',
      'Acquisition Start Time',
      'Acquisition Stop Time',
      'Acquisition Day',
      'Land Cloud Cover (%)',
      ...(showMetadata ? [
        'Satellite',
        'Product Identifier L2',
        'Product Identifier L1',
        'Landsat Scene Identifier',
        'Collection Category',
        'Collection Number',
        'Nadir/Off Nadir',
        'Roll Angle',
        'Date Product Generated L2',
        'Date Product Generated L1',
        'Station Identifier',
        'Day/Night Indicator',
        'Scene Cloud Cover L1',
        'Ground Control Points Model',
        'Ground Control Points Version',
        'Geometric RMSE Model',
        'Geometric RMSE Model X',
        'Geometric RMSE Model Y',
        'Processing Software Version',
        'Sun Elevation L0RA',
        'Sun Azimuth L0RA',
        'Sensor Identifier',
        'Product Map Projection L1',
        'UTM Zone',
        'Datum',
        'Ellipsoid',
        'Scene Center Lat DMS',
        'Scene Center Long DMS',
        'Corner Upper Left Lat DMS',
        'Corner Upper Left Long DMS',
        'Corner Upper Right Lat DMS',
        'Corner Upper Right Long DMS',
        'Corner Lower Left Lat DMS',
        'Corner Lower Left Long DMS',
        'Corner Lower Right Lat DMS',
        'Corner Lower Right Long DMS',
        'Scene Center Latitude',
        'Scene Center Longitude',
        'Corner Upper Left Latitude',
        'Corner Upper Left Longitude',
        'Corner Upper Right Latitude',
        'Corner Upper Right Longitude',
        'Corner Lower Left Latitude',
        'Corner Lower Left Longitude',
        'Corner Lower Right Latitude',
        'Corner Lower Right Longitude'
      ] : [])
    ];

    csvRows.push(headers.join(','));

    sortedData.forEach(item => {
      const values = [
        item.wrsPath,
        item.wrsRow,
        item.acquisitionStartTime,
        item.acquisitionStopTime,
        item.acquisitionDay,
        item.landCloudCover,
        ...(showMetadata ? [
          item.satellite,
          item.productIdentifierL2,
          item.productIdentifierL1,
          item.landsatSceneIdentifier,
          item.collectionCategory,
          item.collectionNumber,
          item.nadirOffNadir,
          item.rollAngle,
          item.dateProductGeneratedL2,
          item.dateProductGeneratedL1,
          item.stationIdentifier,
          item.dayNightIndicator,
          item.sceneCloudCoverL1,
          item.groundControlPointsModel,
          item.groundControlPointsVersion,
          item.geometricRMSEModel,
          item.geometricRMSEModelX,
          item.geometricRMSEModelY,
          item.processingSoftwareVersion,
          item.sunElevationL0RA,
          item.sunAzimuthL0RA,
          item.sensorIdentifier,
          item.productMapProjectionL1,
          item.utmZone,
          item.datum,
          item.ellipsoid,
          item.sceneCenterLatDMS,
          item.sceneCenterLongDMS,
          item.cornerUpperLeftLatDMS,
          item.cornerUpperLeftLongDMS,
          item.cornerUpperRightLatDMS,
          item.cornerUpperRightLongDMS,
          item.cornerLowerLeftLatDMS,
          item.cornerLowerLeftLongDMS,
          item.cornerLowerRightLatDMS,
          item.cornerLowerRightLongDMS,
          item.sceneCenterLatitude,
          item.sceneCenterLongitude,
          item.cornerUpperLeftLatitude,
          item.cornerUpperLeftLongitude,
          item.cornerUpperRightLatitude,
          item.cornerUpperRightLongitude,
          item.cornerLowerLeftLatitude,
          item.cornerLowerLeftLongitude,
          item.cornerLowerRightLatitude,
          item.cornerLowerRightLongitude
        ] : [])
      ];

      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landsat_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Landsat Acquisition Data</h1>

      <label>
        Cloud Cover Threshold (%):
        <input
          type="range"
          min="0"
          max="100"
          value={cloudCoverThreshold}
          onChange={(e) => setCloudCoverThreshold(e.target.value)}
        />
        {cloudCoverThreshold}%
      </label>

      <div>
        <label>
          From (YYYY-MM-DD):
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>

        <label>
          To (YYYY-MM-DD):
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>

        <label>
          Show Metadata
          <input
            type="checkbox"
            checked={showMetadata}
            onChange={() => setShowMetadata(!showMetadata)}
          />
        </label>
      </div>

      <button onClick={downloadCSV}>Download CSV</button>

      <table>
        <thead>
          <tr>
            <th>wrsPath</th>
            <th>wrsRow</th>
            <th>Acquisition Start Time</th>
            <th>Acquisition Stop Time</th>
            <th>Acquisition Day</th>
            <th>Land Cloud Cover (%)</th>
            {showMetadata && (
              <>
                <th>Satellite</th>
                <th>Product Identifier L2</th>
                <th>Product Identifier L1</th>
                <th>Landsat Scene Identifier</th>
                <th>Collection Category</th>
                <th>Collection Number</th>
                <th>Nadir/Off Nadir</th>
                <th>Roll Angle</th>
                <th>Date Product Generated L2</th>
                <th>Date Product Generated L1</th>
                <th>Station Identifier</th>
                <th>Day/Night Indicator</th>
                <th>Scene Cloud Cover L1</th>
                <th>Ground Control Points Model</th>
                <th>Ground Control Points Version</th>
                <th>Geometric RMSE Model</th>
                <th>Geometric RMSE Model X</th>
                <th>Geometric RMSE Model Y</th>
                <th>Processing Software Version</th>
                <th>Sun Elevation L0RA</th>
                <th>Sun Azimuth L0RA</th>
                <th>Sensor Identifier</th>
                <th>Product Map Projection L1</th>
                <th>UTM Zone</th>
                <th>Datum</th>
                <th>Ellipsoid</th>
                <th>Scene Center Lat DMS</th>
                <th>Scene Center Long DMS</th>
                <th>Corner Upper Left Lat DMS</th>
                <th>Corner Upper Left Long DMS</th>
                <th>Corner Upper Right Lat DMS</th>
                <th>Corner Upper Right Long DMS</th>
                <th>Corner Lower Left Lat DMS</th>
                <th>Corner Lower Left Long DMS</th>
                <th>Corner Lower Right Lat DMS</th>
                <th>Corner Lower Right Long DMS</th>
                <th>Scene Center Latitude</th>
                <th>Scene Center Longitude</th>
                <th>Corner Upper Left Latitude</th>
                <th>Corner Upper Left Longitude</th>
                <th>Corner Upper Right Latitude</th>
                <th>Corner Upper Right Longitude</th>
                <th>Corner Lower Left Latitude</th>
                <th>Corner Lower Left Longitude</th>
                <th>Corner Lower Right Latitude</th>
                <th>Corner Lower Right Longitude</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={index}>
              <td>{item.wrsPath}</td>
              <td>{item.wrsRow}</td>
              <td>{item.acquisitionStartTime}</td>
              <td>{item.acquisitionStopTime}</td>
              <td>{item.acquisitionDay}</td>
              <td>{item.landCloudCover}</td>
              {showMetadata && (
                <>
                  <td>{item.satellite}</td>
                  <td>{item.productIdentifierL2}</td>
                  <td>{item.productIdentifierL1}</td>
                  <td>{item.landsatSceneIdentifier}</td>
                  <td>{item.collectionCategory}</td>
                  <td>{item.collectionNumber}</td>
                  <td>{item.nadirOffNadir}</td>
                  <td>{item.rollAngle}</td>
                  <td>{item.dateProductGeneratedL2}</td>
                  <td>{item.dateProductGeneratedL1}</td>
                  <td>{item.stationIdentifier}</td>
                  <td>{item.dayNightIndicator}</td>
                  <td>{item.sceneCloudCoverL1}</td>
                  <td>{item.groundControlPointsModel}</td>
                  <td>{item.groundControlPointsVersion}</td>
                  <td>{item.geometricRMSEModel}</td>
                  <td>{item.geometricRMSEModelX}</td>
                  <td>{item.geometricRMSEModelY}</td>
                  <td>{item.processingSoftwareVersion}</td>
                  <td>{item.sunElevationL0RA}</td>
                  <td>{item.sunAzimuthL0RA}</td>
                  <td>{item.sensorIdentifier}</td>
                  <td>{item.productMapProjectionL1}</td>
                  <td>{item.utmZone}</td>
                  <td>{item.datum}</td>
                  <td>{item.ellipsoid}</td>
                  <td>{item.sceneCenterLatDMS}</td>
                  <td>{item.sceneCenterLongDMS}</td>
                  <td>{item.cornerUpperLeftLatDMS}</td>
                  <td>{item.cornerUpperLeftLongDMS}</td>
                  <td>{item.cornerUpperRightLatDMS}</td>
                  <td>{item.cornerUpperRightLongDMS}</td>
                  <td>{item.cornerLowerLeftLatDMS}</td>
                  <td>{item.cornerLowerLeftLongDMS}</td>
                  <td>{item.cornerLowerRightLatDMS}</td>
                  <td>{item.cornerLowerRightLongDMS}</td>
                  <td>{item.sceneCenterLatitude}</td>
                  <td>{item.sceneCenterLongitude}</td>
                  <td>{item.cornerUpperLeftLatitude}</td>
                  <td>{item.cornerUpperLeftLongitude}</td>
                  <td>{item.cornerUpperRightLatitude}</td>
                  <td>{item.cornerUpperRightLongitude}</td>
                  <td>{item.cornerLowerLeftLatitude}</td>
                  <td>{item.cornerLowerLeftLongitude}</td>
                  <td>{item.cornerLowerRightLatitude}</td>
                  <td>{item.cornerLowerRightLongitude}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Results;
