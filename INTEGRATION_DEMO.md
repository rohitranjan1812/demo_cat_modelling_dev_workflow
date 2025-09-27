# Cat Modeling Integration System - Demo Guide

## Overview

This guide demonstrates the complete integration between exposure, hazard, and vulnerability modules for comprehensive CAT risk modeling. The integration provides seamless data flow, unified risk assessment, and financial calculation interfaces.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAT MODELING INTEGRATION SYSTEM              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Exposure   │  │   Hazard    │  │Vulnerability│             │
│  │   Module    │  │   Module    │  │   Module    │             │
│  │             │  │             │  │             │             │
│  │ • Accounts  │  │ • Hazards   │  │ • Vulnerab. │             │
│  │ • Locations │  │ • Events    │  │ • Factors   │             │
│  │ • Policies  │  │ • Zones     │  │ • Mitigat.  │             │
│  │ • Exposure  │  │ • Scenarios │  │ • Assess.   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              INTEGRATION SERVICE LAYER                      │ │
│  │                                                             │ │
│  │ • Location Risk Assessment                                  │ │
│  │ • Account Risk Analysis                                     │ │
│  │ • Financial Risk Metrics                                    │ │
│  │ • Risk Dashboard                                            │ │
│  │ • Risk Comparison                                           │ │
│  │ • Data Export                                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                           │                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              FINANCIAL CALCULATION MODULE                   │ │
│  │                                                             │ │
│  │ • Expected Loss (EL)                                        │ │
│  │ • Value at Risk (VaR)                                       │ │
│  │ • Tail Value at Risk (TVaR)                                 │ │
│  │ • Standard Deviation                                        │ │
│  │ • Risk-Adjusted Exposure                                    │ │
│  │ • Risk KPIs & Metrics                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Location Risk Assessment
**Endpoint**: `GET /api/v1/integration/risk/location`

**Purpose**: Get comprehensive risk assessment for a specific geographic location

**Example Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/integration/risk/location?latitude=25.7617&longitude=-80.1918&bufferKm=50&hazardTypes=Hurricane,Flood&includeVulnerability=true&includeExposure=true&currency=USD"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 25.7617,
      "longitude": -80.1918,
      "bufferKm": 50
    },
    "analysis": {
      "hazards": 3,
      "vulnerabilities": 2,
      "accounts": 5,
      "zones": 1,
      "scenarios": 0
    },
    "riskMetrics": {
      "hazardRiskScore": 6.5,
      "vulnerabilityRiskScore": 7.2,
      "combinedRiskScore": 6.85,
      "overallRiskLevel": "High",
      "totalExposure": 5000000,
      "currency": "USD",
      "dataQuality": {
        "score": 0.85,
        "level": "High",
        "factors": {
          "hazardData": 3,
          "vulnerabilityData": 2,
          "accountData": 5
        }
      }
    },
    "recommendations": [
      {
        "type": "High Risk Alert",
        "priority": "Critical",
        "message": "Location has high risk exposure. Immediate risk mitigation measures recommended.",
        "actions": [
          "Review insurance coverage",
          "Implement emergency response plans",
          "Consider risk transfer options"
        ]
      }
    ]
  }
}
```

### 2. Account Risk Analysis
**Endpoint**: `GET /api/v1/integration/risk/account/:accountId`

**Purpose**: Get account-specific risk analysis with integrated hazard and vulnerability data

**Example Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/integration/risk/account/ACC-123456?includeChildAccounts=true&hazardTypes=Hurricane,Flood&currency=USD&riskThreshold=0.5"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "account": {
      "accountId": "ACC-123456",
      "accountName": "Miami Property Portfolio",
      "accountType": "Primary",
      "totalExposure": 5000000,
      "currency": "USD",
      "regions": ["North America"],
      "riskProfile": "High"
    },
    "childAccounts": [],
    "riskMetrics": {
      "totalExposure": 5000000,
      "averageRiskScore": 6.5,
      "highRiskLocations": 2,
      "criticalHazards": ["Hurricane", "Flood"],
      "currency": "USD",
      "locationCount": 5
    },
    "recommendations": [
      {
        "type": "Account Risk Management",
        "priority": "High",
        "message": "Account exceeds risk threshold",
        "actions": [
          "Review risk limits",
          "Consider risk transfer",
          "Implement monitoring"
        ]
      }
    ]
  }
}
```

### 3. Financial Risk Metrics
**Endpoint**: `POST /api/v1/integration/financial/:accountId/metrics`

**Purpose**: Calculate financial risk metrics for financial calculation module integration

**Example Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/integration/financial/ACC-123456/metrics" \
  -H "Content-Type: application/json" \
  -d '{
    "hazardTypes": ["Hurricane", "Flood"],
    "timeHorizon": 1,
    "confidenceLevel": 0.95,
    "currency": "USD",
    "includeVulnerabilityAdjustment": true
  }'
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "expectedLoss": 300000,
    "valueAtRisk": 450000,
    "tailValueAtRisk": 500000,
    "standardDeviation": 150000,
    "riskAdjustedExposure": 5500000,
    "hazardMetrics": {
      "Hurricane": {
        "count": 2,
        "averageProbability": 0.3,
        "maxSeverity": 4,
        "totalExposure": 2000000
      },
      "Flood": {
        "count": 1,
        "averageProbability": 0.2,
        "maxSeverity": 3,
        "totalExposure": 1500000
      }
    },
    "vulnerabilityAdjustedMetrics": {
      "adjustedExposure": 6000000,
      "vulnerabilityMultiplier": 1.2,
      "averageVulnerabilityScore": 6.5
    },
    "timeHorizonAdjustments": {
      "adjustedRiskScore": 6.5,
      "timeAdjustmentFactor": 1.0,
      "timeHorizon": 1
    },
    "currency": "USD",
    "confidenceLevel": 0.95,
    "timeHorizon": 1,
    "calculationTimestamp": "2024-01-15T10:30:00Z",
    "dataQuality": {
      "score": 0.8,
      "level": "High",
      "factors": {
        "hazardData": 2,
        "vulnerabilityData": 1,
        "accountData": 1
      }
    }
  }
}
```

### 4. Risk Comparison
**Endpoint**: `POST /api/v1/integration/risk/comparison`

**Purpose**: Compare risk between multiple locations

**Example Request**:
```bash
curl -X POST "http://localhost:3000/api/v1/integration/risk/comparison" \
  -H "Content-Type: application/json" \
  -d '{
    "locations": [
      {
        "latitude": 25.7617,
        "longitude": -80.1918,
        "name": "Miami",
        "bufferKm": 50,
        "hazardTypes": ["Hurricane", "Flood"],
        "currency": "USD"
      },
      {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "name": "New York",
        "bufferKm": 50,
        "hazardTypes": ["Hurricane", "Flood"],
        "currency": "USD"
      }
    ]
  }'
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "location": {
          "latitude": 25.7617,
          "longitude": -80.1918,
          "name": "Miami"
        },
        "riskAssessment": {
          "riskMetrics": {
            "combinedRiskScore": 7.5,
            "totalExposure": 3000000
          }
        }
      },
      {
        "location": {
          "latitude": 40.7128,
          "longitude": -74.0060,
          "name": "New York"
        },
        "riskAssessment": {
          "riskMetrics": {
            "combinedRiskScore": 5.2,
            "totalExposure": 5000000
          }
        }
      }
    ],
    "comparison": {
      "highestRisk": 7.5,
      "lowestRisk": 5.2,
      "averageRisk": 6.35,
      "highestExposure": 5000000,
      "lowestExposure": 3000000,
      "averageExposure": 4000000,
      "riskRange": 2.3,
      "exposureRange": 2000000
    },
    "summary": {
      "totalLocations": 2,
      "highestRisk": 7.5,
      "lowestRisk": 5.2,
      "averageRisk": 6.35
    }
  }
}
```

### 5. Risk Dashboard
**Endpoint**: `GET /api/v1/integration/dashboard`

**Purpose**: Get aggregated risk overview and statistics

**Example Request**:
```bash
curl -X GET "http://localhost:3000/api/v1/integration/dashboard?region=North%20America&hazardTypes=Hurricane,Flood&timeRange=30d&currency=USD"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalHazards": 15,
      "totalVulnerabilities": 25,
      "totalAccounts": 50,
      "totalExposure": 100000000,
      "currency": "USD"
    },
    "riskIndicators": {
      "overallRiskLevel": "Medium",
      "trend": "increasing",
      "change": 0.1
    },
    "hazardStats": {
      "byType": {
        "Hurricane": 8,
        "Earthquake": 4,
        "Flood": 3
      }
    },
    "vulnerabilityStats": {
      "byType": {
        "Physical": 12,
        "Social": 8,
        "Economic": 5
      }
    },
    "accountStats": {
      "byRegion": {
        "North America": 30,
        "Europe": 20
      }
    },
    "recentEvents": [],
    "riskTrends": {
      "trend": "stable",
      "change": 0.05
    },
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

## Key Features

### 1. Unified Risk Assessment
- **Integrated Data**: Seamlessly combines hazard, vulnerability, and exposure data
- **Comprehensive Metrics**: Provides hazard risk score, vulnerability risk score, and combined risk score
- **Risk Levels**: Categorical classification from Very Low to Extreme
- **Data Quality**: Assesses and reports data quality across all modules

### 2. Financial Calculation Interface
- **Expected Loss (EL)**: Calculates expected loss based on exposure and risk
- **Value at Risk (VaR)**: Statistical measure of potential loss
- **Tail Value at Risk (TVaR)**: Expected loss in worst-case scenarios
- **Standard Deviation**: Risk volatility measurement
- **Risk-Adjusted Exposure**: Exposure adjusted for risk factors

### 3. Geographic Integration
- **Spatial Queries**: Efficient location-based data retrieval
- **Buffer Zones**: Configurable radius for area analysis
- **Multi-Location Comparison**: Compare risk across multiple locations
- **Administrative Boundaries**: Country, state, region classifications

### 4. Real-time Monitoring
- **Risk Alerts**: Automated alerts for high-risk situations
- **Dashboard**: Real-time risk overview and statistics
- **Trend Analysis**: Historical risk trend monitoring
- **Data Export**: Export risk data in multiple formats

## Testing the Integration

### 1. Start the Server
```bash
npm start
```

### 2. Test Health Endpoint
```bash
curl -X GET "http://localhost:3000/api/v1/integration/health"
```

### 3. Run Integration Tests
```bash
npm test -- --testPathPattern=integration
```

### 4. Test Location Risk Assessment
```bash
curl -X GET "http://localhost:3000/api/v1/integration/risk/location?latitude=25.7617&longitude=-80.1918&bufferKm=50"
```

### 5. Test Account Risk Analysis
```bash
curl -X GET "http://localhost:3000/api/v1/integration/risk/account/ACC-123456"
```

### 6. Test Financial Metrics
```bash
curl -X POST "http://localhost:3000/api/v1/integration/financial/ACC-123456/metrics" \
  -H "Content-Type: application/json" \
  -d '{"hazardTypes": ["Hurricane"], "timeHorizon": 1, "confidenceLevel": 0.95, "currency": "USD"}'
```

## Benefits of Integration

### 1. **Unified Risk View**
- Single API for comprehensive risk assessment
- Consistent risk scoring across all modules
- Integrated recommendations and alerts

### 2. **Financial Calculation Ready**
- Direct interface for financial calculation module
- Standardized risk metrics and KPIs
- Multi-currency support

### 3. **Scalable Architecture**
- Modular design for easy extension
- Efficient data retrieval and processing
- Comprehensive error handling

### 4. **Data Quality Assurance**
- Built-in data quality assessment
- Validation schemas for all inputs
- Consistency checks across modules

### 5. **Developer Friendly**
- Comprehensive API documentation
- Extensive test coverage
- Clear error messages and validation

## Conclusion

The integration system provides a robust, scalable, and maintainable solution for comprehensive CAT risk modeling. By seamlessly integrating exposure, hazard, and vulnerability modules, it enables accurate risk assessment, financial calculation, and informed decision-making for catastrophe risk management.

The system is ready for production use and provides a solid foundation for future enhancements and integrations.
