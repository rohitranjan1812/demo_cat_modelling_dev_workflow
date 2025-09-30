const Hazard = require('../models/Hazard');
const HazardEvent = require('../models/HazardEvent');
const HazardZone = require('../models/HazardZone');
const HazardScenario = require('../models/HazardScenario');
const Location = require('../models/Location');
const Policy = require('../models/Policy');
const Account = require('../models/Account');

// Hazard Controller
class HazardController {
  // Get all hazards with filtering and pagination
  static async getAllHazards(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        hazardType,
        hazardCategory,
        severity,
        region,
        country,
        minProbability,
        maxProbability,
        isHistorical,
        isSimulated,
        status = 'Active'
      } = req.query;

      const filter = { status };
      
      if (hazardType) filter.hazardType = hazardType;
      if (hazardCategory) filter.hazardCategory = hazardCategory;
      if (severity) filter.severity = severity;
      if (region) filter.affectedRegions = region;
      if (country) filter.affectedCountries = country;
      if (isHistorical !== undefined) filter.isHistorical = isHistorical === 'true';
      if (isSimulated !== undefined) filter.isSimulated = isSimulated === 'true';
      
      if (minProbability || maxProbability) {
        filter.probability = {};
        if (minProbability) filter.probability.$gte = parseFloat(minProbability);
        if (maxProbability) filter.probability.$lte = parseFloat(maxProbability);
      }

      const hazards = await Hazard.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const total = await Hazard.countDocuments(filter);

      res.json({
        success: true,
        data: hazards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazards',
        error: error.message
      });
    }
  }

  // Get hazard by ID
  static async getHazardById(req, res) {
    try {
      const { id } = req.params;
      const hazard = await Hazard.findOne({ hazardId: id });

      if (!hazard) {
        return res.status(404).json({
          success: false,
          message: 'Hazard not found'
        });
      }

      res.json({
        success: true,
        data: hazard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard',
        error: error.message
      });
    }
  }

  // Create new hazard
  static async createHazard(req, res) {
    try {
      const hazardData = {
        ...req.body,
        createdBy: req.user?.id || 'system',
        lastModifiedBy: req.user?.id || 'system'
      };

      const hazard = new Hazard(hazardData);
      await hazard.save();

      res.status(201).json({
        success: true,
        message: 'Hazard created successfully',
        data: hazard
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating hazard',
        error: error.message
      });
    }
  }

  // Update hazard
  static async updateHazard(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        lastModifiedBy: req.user?.id || 'system'
      };

      const hazard = await Hazard.findOneAndUpdate(
        { hazardId: id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!hazard) {
        return res.status(404).json({
          success: false,
          message: 'Hazard not found'
        });
      }

      res.json({
        success: true,
        message: 'Hazard updated successfully',
        data: hazard
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating hazard',
        error: error.message
      });
    }
  }

  // Delete hazard
  static async deleteHazard(req, res) {
    try {
      const { id } = req.params;
      const hazard = await Hazard.findOneAndDelete({ hazardId: id });

      if (!hazard) {
        return res.status(404).json({
          success: false,
          message: 'Hazard not found'
        });
      }

      res.json({
        success: true,
        message: 'Hazard deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting hazard',
        error: error.message
      });
    }
  }

  // Get hazards affecting a specific location
  static async getHazardsAffectingLocation(req, res) {
    try {
      const { latitude, longitude, bufferKm = 0 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const hazards = await Hazard.find({ status: 'Active' });
      const affectingHazards = hazards.filter(hazard => 
        hazard.affectsLocation(parseFloat(latitude), parseFloat(longitude), parseFloat(bufferKm))
      );

      res.json({
        success: true,
        data: affectingHazards
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazards affecting location',
        error: error.message
      });
    }
  }

  // Get hazard statistics
  static async getHazardStatistics(req, res) {
    try {
      const stats = await Hazard.aggregate([
        {
          $group: {
            _id: null,
            totalHazards: { $sum: 1 },
            avgProbability: { $avg: '$probability' },
            avgHazardScore: { $avg: { $multiply: ['$probability', 10] } }
          }
        }
      ]);

      const severityStats = await Hazard.aggregate([
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);

      const typeStats = await Hazard.aggregate([
        {
          $group: {
            _id: '$hazardType',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          overall: stats[0] || { totalHazards: 0, avgProbability: 0, avgHazardScore: 0 },
          bySeverity: severityStats,
          byType: typeStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard statistics',
        error: error.message
      });
    }
  }
}

// Hazard Event Controller
class HazardEventController {
  // Get all hazard events with filtering and pagination
  static async getAllHazardEvents(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        eventType,
        eventCategory,
        severity,
        region,
        country,
        status,
        startTime,
        endTime
      } = req.query;

      const filter = {};
      
      if (eventType) filter.eventType = eventType;
      if (eventCategory) filter.eventCategory = eventCategory;
      if (severity) filter.severity = severity;
      if (region) filter.affectedRegions = region;
      if (country) filter.affectedCountries = country;
      if (status) filter.status = status;
      
      if (startTime || endTime) {
        filter.startTime = {};
        if (startTime) filter.startTime.$gte = new Date(startTime);
        if (endTime) filter.startTime.$lte = new Date(endTime);
      }

      const events = await HazardEvent.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ startTime: -1 })
        .exec();

      const total = await HazardEvent.countDocuments(filter);

      res.json({
        success: true,
        data: events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard events',
        error: error.message
      });
    }
  }

  // Get hazard event by ID
  static async getHazardEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await HazardEvent.findOne({ eventId: id });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Hazard event not found'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard event',
        error: error.message
      });
    }
  }

  // Create new hazard event
  static async createHazardEvent(req, res) {
    try {
      const eventData = {
        ...req.body,
        createdBy: req.user?.id || 'system',
        lastModifiedBy: req.user?.id || 'system'
      };

      const event = new HazardEvent(eventData);
      await event.save();

      res.status(201).json({
        success: true,
        message: 'Hazard event created successfully',
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating hazard event',
        error: error.message
      });
    }
  }

  // Update hazard event
  static async updateHazardEvent(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        lastModifiedBy: req.user?.id || 'system'
      };

      const event = await HazardEvent.findOneAndUpdate(
        { eventId: id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Hazard event not found'
        });
      }

      res.json({
        success: true,
        message: 'Hazard event updated successfully',
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating hazard event',
        error: error.message
      });
    }
  }

  // Delete hazard event
  static async deleteHazardEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await HazardEvent.findOneAndDelete({ eventId: id });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Hazard event not found'
        });
      }

      res.json({
        success: true,
        message: 'Hazard event deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting hazard event',
        error: error.message
      });
    }
  }

  // Get events affecting a specific location
  static async getEventsAffectingLocation(req, res) {
    try {
      const { latitude, longitude, bufferKm = 0 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const events = await HazardEvent.find({ status: { $ne: 'Closed' } });
      const affectingEvents = events.filter(event => 
        event.affectsLocation(parseFloat(latitude), parseFloat(longitude), parseFloat(bufferKm))
      );

      res.json({
        success: true,
        data: affectingEvents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching events affecting location',
        error: error.message
      });
    }
  }

  // Get ongoing events
  static async getOngoingEvents(req, res) {
    try {
      const events = await HazardEvent.find({ status: 'Ongoing' })
        .sort({ startTime: -1 });

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching ongoing events',
        error: error.message
      });
    }
  }
}

// Hazard Zone Controller
class HazardZoneController {
  // Get all hazard zones with filtering and pagination
  static async getAllHazardZones(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        zoneType,
        zoneCategory,
        region,
        country,
        state,
        riskLevel,
        hazardType
      } = req.query;

      const filter = { status: 'Active' };
      
      if (zoneType) filter.zoneType = zoneType;
      if (zoneCategory) filter.zoneCategory = zoneCategory;
      if (region) filter.region = region;
      if (country) filter.country = country;
      if (state) filter.state = state;
      if (riskLevel) filter['riskLevels.riskLevel'] = riskLevel;
      if (hazardType) filter['riskLevels.hazardType'] = hazardType;

      const zones = await HazardZone.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const total = await HazardZone.countDocuments(filter);

      res.json({
        success: true,
        data: zones,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard zones',
        error: error.message
      });
    }
  }

  // Get hazard zone by ID
  static async getHazardZoneById(req, res) {
    try {
      const { id } = req.params;
      const zone = await HazardZone.findOne({ zoneId: id });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Hazard zone not found'
        });
      }

      res.json({
        success: true,
        data: zone
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard zone',
        error: error.message
      });
    }
  }

  // Create new hazard zone
  static async createHazardZone(req, res) {
    try {
      const zoneData = {
        ...req.body,
        createdBy: req.user?.id || 'system',
        lastModifiedBy: req.user?.id || 'system'
      };

      const zone = new HazardZone(zoneData);
      await zone.save();

      res.status(201).json({
        success: true,
        message: 'Hazard zone created successfully',
        data: zone
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating hazard zone',
        error: error.message
      });
    }
  }

  // Update hazard zone
  static async updateHazardZone(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        lastModifiedBy: req.user?.id || 'system'
      };

      const zone = await HazardZone.findOneAndUpdate(
        { zoneId: id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Hazard zone not found'
        });
      }

      res.json({
        success: true,
        message: 'Hazard zone updated successfully',
        data: zone
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating hazard zone',
        error: error.message
      });
    }
  }

  // Delete hazard zone
  static async deleteHazardZone(req, res) {
    try {
      const { id } = req.params;
      const zone = await HazardZone.findOneAndDelete({ zoneId: id });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Hazard zone not found'
        });
      }

      res.json({
        success: true,
        message: 'Hazard zone deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting hazard zone',
        error: error.message
      });
    }
  }

  // Get zones containing a specific location
  static async getZonesContainingLocation(req, res) {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const zones = await HazardZone.find({ status: 'Active' });
      const containingZones = zones.filter(zone => 
        zone.containsLocation(parseFloat(latitude), parseFloat(longitude))
      );

      res.json({
        success: true,
        data: containingZones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching zones containing location',
        error: error.message
      });
    }
  }
}

// Hazard Scenario Controller
class HazardScenarioController {
  // Get all hazard scenarios with filtering and pagination
  static async getAllHazardScenarios(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        scenarioType,
        scenarioCategory,
        primaryHazard,
        geographicScope,
        region,
        status,
        priority
      } = req.query;

      const filter = {};
      
      if (scenarioType) filter.scenarioType = scenarioType;
      if (scenarioCategory) filter.scenarioCategory = scenarioCategory;
      if (primaryHazard) filter.primaryHazard = primaryHazard;
      if (geographicScope) filter.geographicScope = geographicScope;
      if (region) filter.affectedRegions = region;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      const scenarios = await HazardScenario.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const total = await HazardScenario.countDocuments(filter);

      res.json({
        success: true,
        data: scenarios,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard scenarios',
        error: error.message
      });
    }
  }

  // Get hazard scenario by ID
  static async getHazardScenarioById(req, res) {
    try {
      const { id } = req.params;
      const scenario = await HazardScenario.findOne({ scenarioId: id });

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: 'Hazard scenario not found'
        });
      }

      res.json({
        success: true,
        data: scenario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching hazard scenario',
        error: error.message
      });
    }
  }

  // Create new hazard scenario
  static async createHazardScenario(req, res) {
    try {
      const scenarioData = {
        ...req.body,
        createdBy: req.user?.id || 'system',
        lastModifiedBy: req.user?.id || 'system'
      };

      const scenario = new HazardScenario(scenarioData);
      await scenario.save();

      res.status(201).json({
        success: true,
        message: 'Hazard scenario created successfully',
        data: scenario
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating hazard scenario',
        error: error.message
      });
    }
  }

  // Update hazard scenario
  static async updateHazardScenario(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        lastModifiedBy: req.user?.id || 'system'
      };

      const scenario = await HazardScenario.findOneAndUpdate(
        { scenarioId: id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: 'Hazard scenario not found'
        });
      }

      res.json({
        success: true,
        message: 'Hazard scenario updated successfully',
        data: scenario
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating hazard scenario',
        error: error.message
      });
    }
  }

  // Delete hazard scenario
  static async deleteHazardScenario(req, res) {
    try {
      const { id } = req.params;
      const scenario = await HazardScenario.findOneAndDelete({ scenarioId: id });

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: 'Hazard scenario not found'
        });
      }

      res.json({
        success: true,
        message: 'Hazard scenario deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting hazard scenario',
        error: error.message
      });
    }
  }

  // Run scenario simulation
  static async runScenarioSimulation(req, res) {
    try {
      const { id } = req.params;
      const scenario = await HazardScenario.findOne({ scenarioId: id });

      if (!scenario) {
        return res.status(404).json({
          success: false,
          message: 'Hazard scenario not found'
        });
      }

      // Update scenario status to running
      scenario.status = 'Running';
      scenario.progress = 0;
      scenario.executionInfo.startTime = new Date();
      await scenario.save();

      // Simulate scenario execution (in real implementation, this would run actual models)
      setTimeout(async () => {
        try {
          scenario.status = 'Completed';
          scenario.progress = 100;
          scenario.executionInfo.endTime = new Date();
          
          // Add sample results
          scenario.addResult('Economic Loss', 1000000, 'USD', 'USD');
          scenario.addResult('Casualties', 50, 'people');
          scenario.addResult('Risk Score', scenario.calculateRiskScore());
          
          await scenario.save();
        } catch (error) {
          console.error('Error completing scenario:', error);
        }
      }, 5000); // Simulate 5-second execution

      res.json({
        success: true,
        message: 'Scenario simulation started',
        data: scenario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error running scenario simulation',
        error: error.message
      });
    }
  }

  // Get running scenarios
  static async getRunningScenarios(req, res) {
    try {
      const scenarios = await HazardScenario.find({ status: 'Running' })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: scenarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching running scenarios',
        error: error.message
      });
    }
  }
}

// Combined Hazard Analysis Controller
class HazardAnalysisController {
  // Get comprehensive hazard analysis for a location
  static async getLocationHazardAnalysis(req, res) {
    try {
      const { latitude, longitude, bufferKm = 50 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      // Get all relevant data
      const [hazards, events, zones, scenarios] = await Promise.all([
        Hazard.find({ status: 'Active' }),
        HazardEvent.find({ status: { $ne: 'Closed' } }),
        HazardZone.find({ status: 'Active' }),
        HazardScenario.find({ status: 'Completed' })
      ]);

      // Filter data affecting the location
      const affectingHazards = hazards.filter(hazard => 
        hazard.affectsLocation(parseFloat(latitude), parseFloat(longitude), parseFloat(bufferKm))
      );

      const affectingEvents = events.filter(event => 
        event.affectsLocation(parseFloat(latitude), parseFloat(longitude), parseFloat(bufferKm))
      );

      const containingZones = zones.filter(zone => 
        zone.containsLocation(parseFloat(latitude), parseFloat(longitude))
      );

      // Calculate risk metrics
      const riskMetrics = {
        totalHazards: affectingHazards.length,
        totalEvents: affectingEvents.length,
        totalZones: containingZones.length,
        totalScenarios: scenarios.length,
        maxSeverity: affectingHazards.length > 0 ? 
          affectingHazards.reduce((max, h) => {
            const severityOrder = ['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme'];
            return severityOrder.indexOf(h.severity) > severityOrder.indexOf(max) ? h.severity : max;
          }, 'Minor') : 'None',
        avgProbability: affectingHazards.length > 0 ? 
          affectingHazards.reduce((sum, h) => sum + h.probability, 0) / affectingHazards.length : 0,
        totalEconomicImpact: affectingEvents.reduce((sum, e) => sum + e.getTotalEconomicImpact(), 0),
        totalCasualties: affectingEvents.reduce((sum, e) => sum + e.getTotalCasualties(), 0)
      };

      res.json({
        success: true,
        data: {
          location: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            bufferKm: parseFloat(bufferKm)
          },
          hazards: affectingHazards,
          events: affectingEvents,
          zones: containingZones,
          riskMetrics
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error performing hazard analysis',
        error: error.message
      });
    }
  }

  // Get hazard exposure analysis for a policy
  static async getPolicyHazardExposure(req, res) {
    try {
      const { policyId } = req.params;
      
      const policy = await Policy.findOne({ policyId });
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }

      // Get locations associated with the policy
      const locations = await Location.find({
        'associatedPolicies.policyId': policyId,
        status: 'Active'
      });

      if (locations.length === 0) {
        return res.json({
          success: true,
          data: {
            policy: policy,
            locations: [],
            hazardExposure: {
              totalExposure: 0,
              affectedLocations: 0,
              riskLevel: 'Low'
            }
          }
        });
      }

      // Analyze hazard exposure for each location
      const locationAnalyses = [];
      let totalExposure = 0;
      let affectedLocations = 0;

      for (const location of locations) {
        const [hazards, events, zones] = await Promise.all([
          Hazard.find({ status: 'Active' }),
          HazardEvent.find({ status: { $ne: 'Closed' } }),
          HazardZone.find({ status: 'Active' })
        ]);

        const affectingHazards = hazards.filter(hazard => 
          hazard.affectsLocation(location.coordinates.latitude, location.coordinates.longitude)
        );

        const affectingEvents = events.filter(event => 
          event.affectsLocation(location.coordinates.latitude, location.coordinates.longitude)
        );

        const containingZones = zones.filter(zone => 
          zone.containsLocation(location.coordinates.latitude, location.coordinates.longitude)
        );

        if (affectingHazards.length > 0 || affectingEvents.length > 0 || containingZones.length > 0) {
          affectedLocations++;
          totalExposure += location.totalExposure;
        }

        locationAnalyses.push({
          location: location,
          hazards: affectingHazards,
          events: affectingEvents,
          zones: containingZones,
          riskLevel: affectingHazards.length > 0 ? 'High' : 
                    affectingEvents.length > 0 ? 'Medium' : 'Low'
        });
      }

      const overallRiskLevel = affectedLocations > 0 ? 
        (affectedLocations / locations.length > 0.5 ? 'High' : 'Medium') : 'Low';

      res.json({
        success: true,
        data: {
          policy: policy,
          locations: locationAnalyses,
          hazardExposure: {
            totalExposure: totalExposure,
            affectedLocations: affectedLocations,
            totalLocations: locations.length,
            riskLevel: overallRiskLevel
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error analyzing policy hazard exposure',
        error: error.message
      });
    }
  }
}

module.exports = {
  HazardController,
  HazardEventController,
  HazardZoneController,
  HazardScenarioController,
  HazardAnalysisController
};










