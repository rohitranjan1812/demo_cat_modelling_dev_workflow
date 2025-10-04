/**
 * Shared Geographic Schemas
 * Standardized geographic data structures for consistent usage across models
 */

const mongoose = require('../config/mongoose-wrapper');
const { REGIONS, AREA_UNITS, DISTANCE_UNITS } = require('../config/constants');

/**
 * Coordinates Schema
 * Standard lat/lon coordinates with optional elevation
 */
const coordinatesSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
    validate: {
      validator: function(v) {
        return !isNaN(v) && v >= -90 && v <= 90;
      },
      message: 'Latitude must be between -90 and 90 degrees'
    }
  },
  
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
    validate: {
      validator: function(v) {
        return !isNaN(v) && v >= -180 && v <= 180;
      },
      message: 'Longitude must be between -180 and 180 degrees'
    }
  },
  
  elevation: {
    type: Number,
    min: -1000, // Dead Sea level
    max: 10000, // Above Mt. Everest
    default: 0,
    description: 'Elevation in meters above sea level'
  }
}, { _id: false });

/**
 * Address Schema
 * Standard address format
 */
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  city: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  state: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  postalCode: {
    type: String,
    trim: true,
    maxlength: 20
  },
  
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  region: {
    type: String,
    required: true,
    enum: REGIONS
  }
}, { _id: false });

/**
 * Geographic Location Schema
 * Comprehensive geographic location with coordinates and address
 */
const geographicLocationSchema = new mongoose.Schema({
  coordinates: {
    type: coordinatesSchema,
    required: true
  },
  
  address: {
    type: addressSchema,
    required: true
  },
  
  locationType: {
    type: String,
    enum: ['Point', 'Area', 'Polygon', 'Line'],
    default: 'Point'
  }
}, { _id: false });

/**
 * Geographic Area Schema
 * For representing geographic areas (circles, polygons)
 */
const geographicAreaSchema = new mongoose.Schema({
  centerLatitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  
  centerLongitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  
  radius: {
    type: Number,
    min: 0,
    description: 'Radius of circular area'
  },
  
  radiusUnit: {
    type: String,
    enum: DISTANCE_UNITS,
    default: 'km'
  },
  
  area: {
    type: Number,
    min: 0,
    description: 'Total area size'
  },
  
  areaUnit: {
    type: String,
    enum: AREA_UNITS,
    default: 'km2'
  },
  
  polygon: {
    type: [[[Number]]], // Array of coordinate arrays for complex shapes
    description: 'GeoJSON-style polygon coordinates [[[lon, lat], [lon, lat], ...]]'
  },
  
  boundingBox: {
    northEast: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    },
    southWest: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    }
  }
}, { _id: false });

/**
 * GeoJSON Point Schema
 * Standard GeoJSON point format for geospatial queries
 */
const geoJSONPointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length === 2 &&
               v[0] >= -180 && v[0] <= 180 && // longitude
               v[1] >= -90 && v[1] <= 90;     // latitude
      },
      message: 'Coordinates must be [longitude, latitude] with valid ranges'
    }
  }
}, { _id: false });

/**
 * GeoJSON Polygon Schema
 * Standard GeoJSON polygon format for geospatial queries
 */
const geoJSONPolygonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true,
    default: 'Polygon'
  },
  coordinates: {
    type: [[[Number]]], // Array of linear rings
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0 &&
               v[0].length >= 4 && // At least 4 points (first and last must be the same)
               JSON.stringify(v[0][0]) === JSON.stringify(v[0][v[0].length - 1]); // Closed ring
      },
      message: 'Polygon must have at least 4 points with first and last point being the same'
    }
  }
}, { _id: false });

/**
 * Administrative Division Schema
 * For representing administrative boundaries
 */
const administrativeDivisionSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['Country', 'State', 'Province', 'Region', 'County', 'District', 'Municipality', 'City', 'Town', 'Village']
  },
  
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  code: {
    type: String,
    trim: true,
    maxlength: 20,
    description: 'ISO code or local administrative code'
  },
  
  parentDivision: {
    level: String,
    name: String,
    code: String
  }
}, { _id: false });

/**
 * Helper functions for geographic calculations
 */
const geographicHelpers = {
  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  /**
   * Convert radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} Angle in degrees
   */
  toDegrees(radians) {
    return radians * (180 / Math.PI);
  },

  /**
   * Create a bounding box around a point with given radius
   * @param {number} lat - Center latitude
   * @param {number} lon - Center longitude
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Object} Bounding box with northEast and southWest corners
   */
  createBoundingBox(lat, lon, radiusKm) {
    const latDelta = radiusKm / 111; // Approximate km to degrees
    const lonDelta = radiusKm / (111 * Math.cos(this.toRadians(lat)));
    
    return {
      northEast: {
        latitude: Math.min(lat + latDelta, 90),
        longitude: Math.min(lon + lonDelta, 180)
      },
      southWest: {
        latitude: Math.max(lat - latDelta, -90),
        longitude: Math.max(lon - lonDelta, -180)
      }
    };
  },

  /**
   * Check if a point is within a bounding box
   * @param {number} lat - Point latitude
   * @param {number} lon - Point longitude
   * @param {Object} boundingBox - Bounding box object
   * @returns {boolean} True if point is within bounding box
   */
  isPointInBoundingBox(lat, lon, boundingBox) {
    return lat >= boundingBox.southWest.latitude &&
           lat <= boundingBox.northEast.latitude &&
           lon >= boundingBox.southWest.longitude &&
           lon <= boundingBox.northEast.longitude;
  },

  /**
   * Convert coordinates to GeoJSON Point
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} GeoJSON Point object
   */
  toGeoJSONPoint(lat, lon) {
    return {
      type: 'Point',
      coordinates: [lon, lat] // GeoJSON uses [longitude, latitude]
    };
  },

  /**
   * Convert GeoJSON Point to standard coordinates
   * @param {Object} geoJSONPoint - GeoJSON Point object
   * @returns {Object} Coordinates object with latitude and longitude
   */
  fromGeoJSONPoint(geoJSONPoint) {
    return {
      latitude: geoJSONPoint.coordinates[1],
      longitude: geoJSONPoint.coordinates[0]
    };
  }
};

// Export schemas and helpers
module.exports = {
  // Schemas
  coordinatesSchema,
  addressSchema,
  geographicLocationSchema,
  geographicAreaSchema,
  geoJSONPointSchema,
  geoJSONPolygonSchema,
  administrativeDivisionSchema,
  
  // Helpers
  geographicHelpers
};
