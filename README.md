# Cat Modeling Exposure Data Model

A scalable and flexible MongoDB-based exposure data model for cat modeling simulation projects. This system supports complex account structures, policy hierarchies, geographic risk distribution, and dynamic sublimit management.

## 🎯 Product Vision

**Mission**: Create a comprehensive, scalable MongoDB-based exposure data model that supports complex cat modeling simulations with flexible account structures, policy hierarchies, geographic risk distribution, and dynamic sublimit management.

**Key Features**:
- **Multi-level Account Hierarchy**: Primary, reinsurance, retrocession accounts
- **Flexible Policy Management**: Coverage types, limits, deductibles, sublimits
- **Geographic Risk Distribution**: Location-based exposure with risk factors
- **Dynamic Sublimit Management**: Per peril, region, or coverage type
- **Special Conditions**: Customizable conditions, exclusions, and endorsements

## 🏗️ Architecture

### Data Models

#### 1. Account Model
- **Purpose**: Represents insurance accounts with hierarchical structure
- **Key Features**: Multi-level hierarchy, risk profiling, geographic scope
- **Relationships**: Parent-child accounts, associated policies

#### 2. Policy Model
- **Purpose**: Manages insurance policies with coverage details
- **Key Features**: Multiple coverage types, peril coverage, risk characteristics
- **Relationships**: Belongs to account, associated with locations

#### 3. Location Model
- **Purpose**: Geographic risk exposure management
- **Key Features**: Coordinates, risk zones, property characteristics
- **Relationships**: Associated with policies, risk factors

#### 4. Sublimit Model
- **Purpose**: Dynamic sublimit management
- **Key Features**: Peril-specific limits, geographic constraints, time-based rules
- **Relationships**: Can be associated with accounts, policies, or locations

#### 5. Special Condition Model
- **Purpose**: Customizable conditions and endorsements
- **Key Features**: Coverage modifications, financial impacts, compliance rules
- **Relationships**: Can be associated with accounts, policies, or locations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cat-modeling-exposure-data-model
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB connection details
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Verify Database and Seed Data**
   ```bash
   # Check if MongoDB is running and has data
   npm run verify:db
   
   # If database is empty, seed with sample data
   npm run seed:fixed
   ```

6. **Start the application**
   ```bash
   # Start backend
   npm run start:backend
   
   # Start frontend (in a new terminal)
   npm run start:frontend
   ```

### Database Setup & Troubleshooting

**If simulations fail or database is empty**, see the comprehensive guide:
📖 **[DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)**

Quick commands:
- `npm run verify:db` - Check database status and contents
- `npm run seed:fixed` - Populate database with sample data
- View the setup guide for detailed troubleshooting steps

### Environment Variables

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cat_modeling_exposure
MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_exposure_test

# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Account Endpoints

#### Create Account
```http
POST /api/v1/accounts
Content-Type: application/json

{
  "accountId": "ACC-123456",
  "accountName": "Test Account",
  "accountType": "Primary",
  "totalExposure": 1000000,
  "currency": "USD",
  "regions": ["North America"],
  "riskProfile": "Medium",
  "createdBy": "user123",
  "lastModifiedBy": "user123"
}
```

#### Get All Accounts
```http
GET /api/v1/accounts?page=1&limit=10&status=Active&search=test
```

#### Get Account by ID
```http
GET /api/v1/accounts/ACC-123456
```

#### Update Account
```http
PUT /api/v1/accounts/ACC-123456
Content-Type: application/json

{
  "accountName": "Updated Account Name",
  "totalExposure": 2000000,
  "lastModifiedBy": "user123"
}
```

#### Delete Account
```http
DELETE /api/v1/accounts/ACC-123456
```

#### Get Child Accounts
```http
GET /api/v1/accounts/ACC-123456/children
```

#### Get Total Exposure
```http
GET /api/v1/accounts/ACC-123456/total-exposure
```

#### Get Accounts by Region
```http
GET /api/v1/accounts/region/North America
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```
tests/
├── setup.js                 # Test database setup
├── models/
│   ├── Account.test.js      # Account model tests
│   ├── Policy.test.js       # Policy model tests
│   ├── Location.test.js     # Location model tests
│   ├── Sublimit.test.js     # Sublimit model tests
│   └── SpecialCondition.test.js # Special condition model tests
└── controllers/
    ├── accountController.test.js
    ├── policyController.test.js
    ├── locationController.test.js
    ├── sublimitController.test.js
    └── specialConditionController.test.js
```

## 🔧 Development Workflow

### Product Owner Role
- **Vision**: Define product requirements and business rules
- **Responsibilities**: 
  - Define data model requirements
  - Specify business logic and validation rules
  - Review and approve feature implementations

### Developer Role
- **Implementation**: Build and maintain the codebase
- **Responsibilities**:
  - Implement data models and API endpoints
  - Write clean, maintainable code
  - Follow best practices and coding standards

### Tester Role
- **Quality Assurance**: Ensure system reliability and correctness
- **Responsibilities**:
  - Write comprehensive test suites
  - Perform integration and unit testing
  - Validate business logic and edge cases

## 📊 Data Model Schema

### Account Schema
```javascript
{
  accountId: String,           // Format: ACC-XXXXXX
  accountName: String,
  accountType: String,         // Primary, Reinsurance, Retrocession, etc.
  parentAccountId: String,     // Reference to parent account
  accountLevel: Number,        // Hierarchy level
  totalExposure: Number,
  currency: String,
  regions: [String],          // Geographic regions
  riskProfile: String,        // Low, Medium, High, Very High
  status: String,             // Active, Inactive, Suspended, Pending
  effectiveDate: Date,
  expiryDate: Date,
  createdBy: String,
  lastModifiedBy: String,
  metadata: Map
}
```

### Policy Schema
```javascript
{
  policyId: String,           // Format: POL-XXXXXXXX
  policyNumber: String,
  accountId: String,          // Reference to account
  policyName: String,
  policyType: String,         // Direct, Reinsurance, Facultative, etc.
  coverages: [{
    coverageType: String,     // Property, Liability, Business Interruption, etc.
    coverageLimit: Number,
    deductible: Number,
    coveragePercentage: Number
  }],
  totalLimit: Number,
  totalDeductible: Number,
  premium: Number,
  currency: String,
  effectiveDate: Date,
  expiryDate: Date,
  coveredRegions: [String],
  coveredPerils: [String],    // Earthquake, Hurricane, Flood, etc.
  riskCharacteristics: {
    occupancyType: String,
    constructionType: String,
    yearBuilt: Number,
    numberOfStories: Number,
    squareFootage: Number
  },
  sublimits: [{
    peril: String,
    limit: Number,
    deductible: Number,
    region: String
  }],
  specialConditions: [{
    conditionType: String,
    description: String,
    effectiveDate: Date,
    expiryDate: Date,
    isActive: Boolean
  }],
  status: String,
  createdBy: String,
  lastModifiedBy: String,
  metadata: Map
}
```

## 🔒 Security Features

- **Input Validation**: Comprehensive data validation using Joi
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers and protection
- **Data Sanitization**: Input sanitization and validation

## 📈 Performance Features

- **Database Indexing**: Optimized MongoDB indexes for fast queries
- **Pagination**: Efficient pagination for large datasets
- **Compression**: Response compression for better performance
- **Connection Pooling**: MongoDB connection pooling
- **Query Optimization**: Optimized database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core data models and API endpoints
- **v1.1.0** - Added comprehensive testing suite
- **v1.2.0** - Enhanced validation and error handling
- **v1.3.0** - Added geographic risk distribution features

---

**Built with ❤️ for the Cat Modeling Community**
