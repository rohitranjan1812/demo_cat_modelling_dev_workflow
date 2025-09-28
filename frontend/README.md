# CAT Modeling Platform - Frontend

A highly interactive and configurable React-based frontend for catastrophe modeling, providing comprehensive risk assessment and simulation tools.

## Features

### 🎯 Core Modules
- **Dashboard**: Real-time overview with system status and key metrics
- **Hazard Management**: Complete CRUD operations for hazards, events, zones, and scenarios
- **Vulnerability Assessment**: Risk scoring and vulnerability analysis tools
- **Simulation Engine**: Advanced simulation configuration and monitoring
- **Integration Services**: Risk assessment and financial analysis
- **Account Management**: User and policy management

### 🚀 Key Capabilities
- **Interactive Maps**: Real-time hazard visualization with Leaflet
- **Advanced Charts**: Dynamic data visualization with Recharts
- **Real-time Updates**: Live simulation progress and system monitoring
- **Responsive Design**: Mobile-first approach with Material-UI
- **Data Export**: CSV and JSON export capabilities
- **Advanced Filtering**: Multi-criteria search and filtering
- **Form Validation**: Comprehensive form validation with Yup

### 🛠 Technology Stack
- **React 18** with TypeScript
- **Material-UI v5** for component library
- **React Query** for data fetching and caching
- **React Hook Form** with Yup validation
- **React Router** for navigation
- **Framer Motion** for animations
- **Leaflet** for interactive maps
- **Recharts** for data visualization
- **Date-fns** for date manipulation

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running on port 3000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api/v1
   REACT_APP_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3001`

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── RecentSimulations.tsx
│   │   │   ├── RiskOverview.tsx
│   │   │   └── HazardMap.tsx
│   │   ├── Hazards/
│   │   │   ├── HazardList.tsx
│   │   │   ├── HazardForm.tsx
│   │   │   ├── HazardDetails.tsx
│   │   │   └── HazardFilters.tsx
│   │   ├── Vulnerabilities/
│   │   │   ├── VulnerabilityList.tsx
│   │   │   ├── VulnerabilityForm.tsx
│   │   │   ├── VulnerabilityDetails.tsx
│   │   │   └── VulnerabilityFilters.tsx
│   │   ├── Simulations/
│   │   │   ├── SimulationList.tsx
│   │   │   ├── SimulationForm.tsx
│   │   │   └── SimulationDetails.tsx
│   │   ├── Integration/
│   │   │   ├── RiskAssessmentCard.tsx
│   │   │   ├── FinancialMetricsCard.tsx
│   │   │   └── RiskComparisonChart.tsx
│   │   └── Layout/
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Hazards/
│   │   ├── Vulnerabilities/
│   │   ├── Simulations/
│   │   ├── Integration/
│   │   ├── Accounts/
│   │   ├── Settings/
│   │   └── NotFound/
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## API Integration

The frontend integrates with the backend API through the `api.ts` service layer:

### Key Endpoints
- **Hazards**: `/api/v1/hazards`
- **Vulnerabilities**: `/api/v1/vulnerabilities`
- **Simulations**: `/api/v1/simulations`
- **Integration**: `/api/v1/integration`
- **Accounts**: `/api/v1/accounts`

### Authentication
Currently uses mock authentication. To implement real authentication:

1. Update the API service to include proper auth headers
2. Add login/logout functionality
3. Implement route protection

## Features in Detail

### Dashboard
- Real-time system metrics
- Interactive hazard map
- Recent simulations overview
- Quick action buttons
- System health monitoring

### Hazard Management
- Complete CRUD operations
- Advanced filtering and search
- Interactive data tables
- Geographic visualization
- Risk assessment tools

### Vulnerability Assessment
- Risk scoring system
- Multi-hazard vulnerability analysis
- Geographic risk mapping
- Assessment history tracking

### Simulation Engine
- Advanced configuration forms
- Real-time progress monitoring
- Results visualization
- Export capabilities

### Integration Services
- Location-based risk assessment
- Financial metrics calculation
- Risk comparison tools
- Data export functionality

## Customization

### Theming
The app uses Material-UI theming. Customize in `src/index.tsx`:

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  // ... other theme options
});
```

### Adding New Components
1. Create component in appropriate folder
2. Export from index file
3. Import and use in pages
4. Add TypeScript types if needed

### API Configuration
Update `src/services/api.ts` to modify:
- Base URL
- Request/response interceptors
- Error handling
- Authentication

## Performance Optimization

- **Code Splitting**: Implemented with React.lazy()
- **Memoization**: React.memo() for expensive components
- **Virtual Scrolling**: For large data tables
- **Image Optimization**: Lazy loading for maps
- **Bundle Analysis**: Use `npm run build` to analyze bundle size

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set these in your production environment:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_MAP_TILE_URL` - Map tile service URL

### Docker Deployment
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API documentation

## Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Advanced reporting tools
- [ ] Integration with external data sources