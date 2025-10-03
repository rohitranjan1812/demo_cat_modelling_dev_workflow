import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Map as MapIcon,
  Layers as LayersIcon,
  FilterList as FilterIcon,
  Fullscreen as FullscreenIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from 'react-query';

import apiService from '../../services/api';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom map component to handle view changes
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
};

const HazardMap: React.FC = () => {
  const [mapType, setMapType] = useState<'hazards' | 'vulnerabilities' | 'risk'>('hazards');
  const [selectedHazardTypes, setSelectedHazardTypes] = useState<string[]>(['Earthquake', 'Hurricane', 'Flood']);
  const [mapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Center of US
  const [mapZoom] = useState(4);

  const { data: hazardsData, isLoading, refetch } = useQuery(
    'hazardsForMap',
    () => apiService.getHazards({ limit: 100, status: 'Active' }),
    {
      refetchInterval: 60000,
    }
  );

  const { data: vulnerabilitiesData } = useQuery(
    'vulnerabilitiesForMap',
    () => apiService.getVulnerabilities({ limit: 100, status: 'Active' }),
    {
      refetchInterval: 120000,
    }
  );

  const getHazardColor = (hazardType: string) => {
    const colors: Record<string, string> = {
      'Earthquake': '#f44336',
      'Hurricane': '#ff9800',
      'Flood': '#2196f3',
      'Wildfire': '#ff5722',
      'Tornado': '#9c27b0',
      'Tsunami': '#00bcd4',
    };
    return colors[hazardType] || '#9e9e9e';
  };

  const getHazardIcon = (hazardType: string) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${getHazardColor(hazardType)};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const getVulnerabilityColor = (riskLevel: string) => {
    const colors: Record<string, string> = {
      'Very High': '#d32f2f',
      'High': '#f44336',
      'Medium': '#ff9800',
      'Low': '#4caf50',
      'Very Low': '#8bc34a',
    };
    return colors[riskLevel] || '#9e9e9e';
  };

  const hazardTypes = [
    'Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Tsunami',
    'Volcanic Eruption', 'Landslide', 'Drought', 'Heat Wave'
  ];

  const handleMapTypeChange = (event: React.MouseEvent<HTMLElement>, newType: string | null) => {
    if (newType !== null) {
      setMapType(newType as any);
    }
  };

  const handleHazardTypeToggle = (hazardType: string) => {
    setSelectedHazardTypes(prev => 
      prev.includes(hazardType) 
        ? prev.filter(type => type !== hazardType)
        : [...prev, hazardType]
    );
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <MapIcon />
            Interactive Hazard Map
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => refetch()} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fullscreen">
              <IconButton>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Map Controls */}
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={mapType}
            exclusive
            onChange={handleMapTypeChange}
            size="small"
            sx={{ mb: 2 }}
          >
            <ToggleButton value="hazards">
              <LayersIcon sx={{ mr: 1 }} />
              Hazards
            </ToggleButton>
            <ToggleButton value="vulnerabilities">
              <FilterIcon sx={{ mr: 1 }} />
              Vulnerabilities
            </ToggleButton>
            <ToggleButton value="risk">
              <MapIcon sx={{ mr: 1 }} />
              Risk Assessment
            </ToggleButton>
          </ToggleButtonGroup>

          {mapType === 'hazards' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {hazardTypes.map((hazardType) => (
                <Chip
                  key={hazardType}
                  label={hazardType}
                  size="small"
                  variant={selectedHazardTypes.includes(hazardType) ? 'filled' : 'outlined'}
                  onClick={() => handleHazardTypeToggle(hazardType)}
                  sx={{
                    backgroundColor: selectedHazardTypes.includes(hazardType) 
                      ? getHazardColor(hazardType) 
                      : 'transparent',
                    color: selectedHazardTypes.includes(hazardType) 
                      ? 'white' 
                      : getHazardColor(hazardType),
                    borderColor: getHazardColor(hazardType),
                    '&:hover': {
                      backgroundColor: `${getHazardColor(hazardType)}20`,
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Map Container */}
        <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Render hazards */}
            {mapType === 'hazards' && Array.isArray(hazardsData?.data) && hazardsData.data.map((hazard: any) => {
              if (!selectedHazardTypes.includes(hazard.hazardType)) return null;
              
              // Use actual coordinates from backend
              if (!hazard.footprint || typeof hazard.footprint.centerLatitude !== 'number' || typeof hazard.footprint.centerLongitude !== 'number') {
                return null; // Skip hazards without valid coordinates
              }
              
              const lat = hazard.footprint.centerLatitude;
              const lng = hazard.footprint.centerLongitude;
              const radius = hazard.footprint.radius ? hazard.footprint.radius * 1000 : 50000; // Convert km to meters, default 50km
              
              return (
                <React.Fragment key={hazard._id}>
                  <Marker
                    position={[lat, lng]}
                    icon={getHazardIcon(hazard.hazardType)}
                  >
                    <Popup>
                      <Box sx={{ p: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          {hazard.hazardName}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Type: {hazard.hazardType}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Severity: {hazard.severity}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Probability: {(hazard.probability * 100).toFixed(1)}%
                        </Typography>
                        {hazard.footprint.radius && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Affected Radius: {hazard.footprint.radius} {hazard.footprint.unit}
                          </Typography>
                        )}
                        <Chip
                          label={hazard.severity}
                          size="small"
                          sx={{
                            backgroundColor: getHazardColor(hazard.hazardType),
                            color: 'white',
                          }}
                        />
                      </Box>
                    </Popup>
                  </Marker>
                  {/* Show affected area circle */}
                  <Circle
                    center={[lat, lng]}
                    radius={radius}
                    pathOptions={{
                      color: getHazardColor(hazard.hazardType),
                      fillColor: getHazardColor(hazard.hazardType),
                      fillOpacity: 0.1,
                      weight: 1,
                    }}
                  />
                </React.Fragment>
              );
            })}

            {/* Render vulnerabilities */}
            {mapType === 'vulnerabilities' && Array.isArray(vulnerabilitiesData?.data) && vulnerabilitiesData.data.map((vulnerability: any) => {
              // Use actual coordinates from backend
              if (!vulnerability.geographicScope || 
                  typeof vulnerability.geographicScope.centerLatitude !== 'number' || 
                  typeof vulnerability.geographicScope.centerLongitude !== 'number') {
                return null; // Skip vulnerabilities without valid coordinates
              }
              
              const lat = vulnerability.geographicScope.centerLatitude;
              const lng = vulnerability.geographicScope.centerLongitude;
              const radius = vulnerability.geographicScope.radius ? vulnerability.geographicScope.radius * 1000 : 50000; // Convert km to meters, default 50km
              
              return (
                <Circle
                  key={vulnerability._id}
                  center={[lat, lng]}
                  radius={radius}
                  pathOptions={{
                    color: getVulnerabilityColor(vulnerability.overallRiskLevel),
                    fillColor: getVulnerabilityColor(vulnerability.overallRiskLevel),
                    fillOpacity: 0.3,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {vulnerability.vulnerabilityName}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Type: {vulnerability.vulnerabilityType}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Category: {vulnerability.vulnerabilityCategory}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Risk Level: {vulnerability.overallRiskLevel}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Score: {vulnerability.overallVulnerabilityScore.toFixed(1)}/10
                      </Typography>
                      {vulnerability.geographicScope.radius && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Affected Radius: {vulnerability.geographicScope.radius} {vulnerability.geographicScope.radiusUnit}
                        </Typography>
                      )}
                      <Chip
                        label={vulnerability.overallRiskLevel}
                        size="small"
                        sx={{
                          backgroundColor: getVulnerabilityColor(vulnerability.overallRiskLevel),
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Popup>
                </Circle>
              );
            })}
          </MapContainer>
        </Box>

        {/* Map Legend */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
            Legend
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {mapType === 'hazards' ? (
              selectedHazardTypes.map((hazardType) => (
                <Box key={hazardType} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: getHazardColor(hazardType),
                    }}
                  />
                  <Typography variant="caption">{hazardType}</Typography>
                </Box>
              ))
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#4caf50',
                  }}
                />
                <Typography variant="caption">Low Risk</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HazardMap;

