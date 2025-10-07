/**
 * Coordinate Conversion Utilities
 * Helps convert between legacy {lat, lng} format and GeoJSON format
 */

import { GeoJSONPoint, CoordinatesLegacy } from '../types/models';

/**
 * Convert GeoJSON Point to legacy coordinates format
 * @param geoJson - GeoJSON Point object
 * @returns Legacy coordinates object
 */
export function geoJsonToCoordinates(geoJson: GeoJSONPoint): CoordinatesLegacy {
  const [longitude, latitude] = geoJson.coordinates;
  return {
    latitude,
    longitude
  };
}

/**
 * Convert legacy coordinates to GeoJSON Point format
 * @param coords - Legacy coordinates object
 * @returns GeoJSON Point object
 */
export function coordinatesToGeoJson(coords: CoordinatesLegacy): GeoJSONPoint {
  return {
    type: 'Point',
    coordinates: [coords.longitude, coords.latitude]
  };
}

/**
 * Convert coordinate arrays to GeoJSON Point format
 * @param longitude - Longitude value
 * @param latitude - Latitude value
 * @returns GeoJSON Point object
 */
export function arrayToGeoJson(longitude: number, latitude: number): GeoJSONPoint {
  return {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
}

/**
 * Extract longitude and latitude from GeoJSON Point
 * @param geoJson - GeoJSON Point object
 * @returns Array containing [longitude, latitude]
 */
export function geoJsonToArray(geoJson: GeoJSONPoint): [number, number] {
  return geoJson.coordinates;
}

/**
 * Validate GeoJSON Point coordinates
 * @param geoJson - GeoJSON Point object
 * @returns True if coordinates are valid
 */
export function isValidGeoJson(geoJson: GeoJSONPoint): boolean {
  if (geoJson.type !== 'Point' || !Array.isArray(geoJson.coordinates)) {
    return false;
  }
  
  const [longitude, latitude] = geoJson.coordinates;
  
  // Check if coordinates are numbers
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return false;
  }
  
  // Check coordinate ranges
  if (longitude < -180 || longitude > 180) {
    return false;
  }
  
  if (latitude < -90 || latitude > 90) {
    return false;
  }
  
  return true;
}

/**
 * Calculate distance between two GeoJSON points using Haversine formula
 * @param point1 - First GeoJSON Point
 * @param point2 - Second GeoJSON Point
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: GeoJSONPoint, point2: GeoJSONPoint): number {
  const [lon1, lat1] = point1.coordinates;
  const [lon2, lat2] = point2.coordinates;
  
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Create a bounding box around a GeoJSON point
 * @param center - Center GeoJSON Point
 * @param radiusKm - Radius in kilometers
 * @returns Bounding box coordinates [minLng, minLat, maxLng, maxLat]
 */
export function createBoundingBox(center: GeoJSONPoint, radiusKm: number): [number, number, number, number] {
  const [centerLng, centerLat] = center.coordinates;
  
  // Approximate conversion: 1 degree = 111 km
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos(toRadians(centerLat)));
  
  return [
    centerLng - lngDelta, // minLng
    centerLat - latDelta, // minLat
    centerLng + lngDelta, // maxLng
    centerLat + latDelta  // maxLat
  ];
}