import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import {
  ApiResponse,
  Hazard,
  HazardEvent,
  HazardZone,
  HazardScenario,
  Vulnerability,
  SimulationRun,
  SimulationConfiguration,
  SimulationResults,
  RiskAssessment,
  FinancialMetrics,
  Account,
  HazardFilters,
  VulnerabilityFilters,
  SimulationFilters,
  Location,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        
        // Show error toast
        toast.error(message);
        
        // Handle specific error codes
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Hazard API methods
  async getHazards(filters: HazardFilters = {}): Promise<ApiResponse<Hazard[]>> {
    const response = await this.api.get('/hazards', { params: filters });
    return response.data;
  }

  async getHazardById(id: string): Promise<ApiResponse<Hazard>> {
    const response = await this.api.get(`/hazards/${id}`);
    return response.data;
  }

  async createHazard(hazard: Partial<Hazard>): Promise<ApiResponse<Hazard>> {
    const response = await this.api.post('/hazards', hazard);
    return response.data;
  }

  async updateHazard(id: string, hazard: Partial<Hazard>): Promise<ApiResponse<Hazard>> {
    const response = await this.api.put(`/hazards/${id}`, hazard);
    return response.data;
  }

  async deleteHazard(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/hazards/${id}`);
    return response.data;
  }

  async getHazardsAffectingLocation(location: Location): Promise<ApiResponse<Hazard[]>> {
    const response = await this.api.get('/hazards/affecting-location', {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
    return response.data;
  }

  async getHazardStatistics(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/hazards/statistics');
    return response.data;
  }

  // Hazard Events API methods
  async getHazardEvents(filters: any = {}): Promise<ApiResponse<HazardEvent[]>> {
    const response = await this.api.get('/hazard-events', { params: filters });
    return response.data;
  }

  async getHazardEventById(id: string): Promise<ApiResponse<HazardEvent>> {
    const response = await this.api.get(`/hazard-events/${id}`);
    return response.data;
  }

  async createHazardEvent(event: Partial<HazardEvent>): Promise<ApiResponse<HazardEvent>> {
    const response = await this.api.post('/hazard-events', event);
    return response.data;
  }

  async updateHazardEvent(id: string, event: Partial<HazardEvent>): Promise<ApiResponse<HazardEvent>> {
    const response = await this.api.put(`/hazard-events/${id}`, event);
    return response.data;
  }

  async deleteHazardEvent(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/hazard-events/${id}`);
    return response.data;
  }

  // Hazard Zones API methods
  async getHazardZones(filters: any = {}): Promise<ApiResponse<HazardZone[]>> {
    const response = await this.api.get('/hazard-zones', { params: filters });
    return response.data;
  }

  async getHazardZoneById(id: string): Promise<ApiResponse<HazardZone>> {
    const response = await this.api.get(`/hazard-zones/${id}`);
    return response.data;
  }

  async createHazardZone(zone: Partial<HazardZone>): Promise<ApiResponse<HazardZone>> {
    const response = await this.api.post('/hazard-zones', zone);
    return response.data;
  }

  async updateHazardZone(id: string, zone: Partial<HazardZone>): Promise<ApiResponse<HazardZone>> {
    const response = await this.api.put(`/hazard-zones/${id}`, zone);
    return response.data;
  }

  async deleteHazardZone(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/hazard-zones/${id}`);
    return response.data;
  }

  // Hazard Scenarios API methods
  async getHazardScenarios(filters: any = {}): Promise<ApiResponse<HazardScenario[]>> {
    const response = await this.api.get('/hazard-scenarios', { params: filters });
    return response.data;
  }

  async getHazardScenarioById(id: string): Promise<ApiResponse<HazardScenario>> {
    const response = await this.api.get(`/hazard-scenarios/${id}`);
    return response.data;
  }

  async createHazardScenario(scenario: Partial<HazardScenario>): Promise<ApiResponse<HazardScenario>> {
    const response = await this.api.post('/hazard-scenarios', scenario);
    return response.data;
  }

  async updateHazardScenario(id: string, scenario: Partial<HazardScenario>): Promise<ApiResponse<HazardScenario>> {
    const response = await this.api.put(`/hazard-scenarios/${id}`, scenario);
    return response.data;
  }

  async deleteHazardScenario(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/hazard-scenarios/${id}`);
    return response.data;
  }

  async runScenarioSimulation(id: string): Promise<ApiResponse> {
    const response = await this.api.post(`/hazard-scenarios/${id}/run`);
    return response.data;
  }

  // Vulnerability API methods
  async getVulnerabilities(filters: VulnerabilityFilters = {}): Promise<ApiResponse<Vulnerability[]>> {
    const response = await this.api.get('/vulnerabilities', { params: filters });
    return response.data;
  }

  async getVulnerabilityById(id: string): Promise<ApiResponse<Vulnerability>> {
    const response = await this.api.get(`/vulnerabilities/${id}`);
    return response.data;
  }

  async createVulnerability(vulnerability: Partial<Vulnerability>): Promise<ApiResponse<Vulnerability>> {
    const response = await this.api.post('/vulnerabilities', vulnerability);
    return response.data;
  }

  async updateVulnerability(id: string, vulnerability: Partial<Vulnerability>): Promise<ApiResponse<Vulnerability>> {
    const response = await this.api.put(`/vulnerabilities/${id}`, vulnerability);
    return response.data;
  }

  async deleteVulnerability(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/vulnerabilities/${id}`);
    return response.data;
  }

  async getVulnerabilitiesAffectingLocation(location: Location): Promise<ApiResponse<Vulnerability[]>> {
    const response = await this.api.get('/vulnerabilities/affecting-location', {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
    return response.data;
  }

  async calculateLocationVulnerabilityScore(location: Location): Promise<ApiResponse<{ score: number; level: string }>> {
    const response = await this.api.get('/vulnerabilities/location-score', {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
    return response.data;
  }

  async getVulnerabilityStatistics(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/vulnerabilities/statistics');
    return response.data;
  }

  // Simulation API methods
  async startSimulation(config: SimulationConfiguration): Promise<ApiResponse<SimulationRun>> {
    const response = await this.api.post('/simulations/start', config);
    return response.data;
  }

  async getSimulationRuns(filters: SimulationFilters = {}): Promise<ApiResponse<SimulationRun[]>> {
    const response = await this.api.get('/simulations/runs', { params: filters });
    return response.data;
  }

  async getSimulationRunById(id: string): Promise<ApiResponse<SimulationRun>> {
    const response = await this.api.get(`/simulations/${id}/status`);
    return response.data;
  }

  async getSimulationResults(id: string, filters: any = {}): Promise<ApiResponse<SimulationResults>> {
    const response = await this.api.get(`/simulations/${id}/results`, { params: filters });
    return response.data;
  }

  async getSimulationEvents(id: string, filters: any = {}): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/simulations/${id}/events`, { params: filters });
    return response.data;
  }

  async getSimulationStatistics(id: string, groupBy?: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/simulations/${id}/statistics`, {
      params: { groupBy },
    });
    return response.data;
  }

  async cancelSimulation(id: string): Promise<ApiResponse> {
    const response = await this.api.post(`/simulations/${id}/cancel`);
    return response.data;
  }

  async exportSimulationData(id: string, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await this.api.get(`/simulations/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async getSimulationDashboard(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/simulations/dashboard');
    return response.data;
  }

  // Integration API methods
  async getLocationRiskAssessment(location: Location, options: any = {}): Promise<ApiResponse<RiskAssessment>> {
    const response = await this.api.get('/integration/risk/location', {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        ...options,
      },
    });
    return response.data;
  }

  async getAccountRiskAnalysis(accountId: string, options: any = {}): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/integration/risk/account/${accountId}`, {
      params: options,
    });
    return response.data;
  }

  async calculateFinancialMetrics(accountId: string, metrics: any): Promise<ApiResponse<FinancialMetrics>> {
    const response = await this.api.post(`/integration/financial/${accountId}/metrics`, metrics);
    return response.data;
  }

  async getRiskComparison(comparisonData: any): Promise<ApiResponse<any>> {
    const response = await this.api.post('/integration/risk/comparison', comparisonData);
    return response.data;
  }

  async getRiskDashboard(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/integration/dashboard');
    return response.data;
  }

  async getRiskAlerts(): Promise<ApiResponse<any[]>> {
    const response = await this.api.get('/integration/alerts');
    return response.data;
  }

  async exportRiskData(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await this.api.get('/integration/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  // Account API methods
  async getAccounts(filters: any = {}): Promise<ApiResponse<Account[]>> {
    const response = await this.api.get('/accounts', { params: filters });
    return response.data;
  }

  async getAccountById(id: string): Promise<ApiResponse<Account>> {
    const response = await this.api.get(`/accounts/${id}`);
    return response.data;
  }

  async createAccount(account: Partial<Account>): Promise<ApiResponse<Account>> {
    const response = await this.api.post('/accounts', account);
    return response.data;
  }

  async updateAccount(id: string, account: Partial<Account>): Promise<ApiResponse<Account>> {
    const response = await this.api.put(`/accounts/${id}`, account);
    return response.data;
  }

  async deleteAccount(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/accounts/${id}`);
    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

