import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import apiService from '../../services/api';
import SimulationList from '../../components/Simulations/SimulationList';
import SimulationForm from '../../components/Simulations/SimulationForm';
import SimulationDetails from '../../components/Simulations/SimulationDetails';
import { SimulationRun, SimulationFilters } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simulation-tabpanel-${index}`}
      aria-labelledby={`simulation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SimulationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SimulationFilters>({
    page: 1,
    limit: 10,
  });
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<SimulationRun | null>(null);

  const queryClient = useQueryClient();

  // Fetch simulations data
  const { data: simulationsData, isLoading, refetch } = useQuery(
    ['simulations', filters],
    () => apiService.getSimulationRuns(filters),
    {
      keepPreviousData: true,
      refetchInterval: 5000, // Refetch every 5 seconds for running simulations
    }
  );

  // Start simulation mutation
  const startSimulationMutation = useMutation(
    (config: any) => apiService.startSimulation(config),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['simulations']);
        toast.success('Simulation started successfully');
        setShowForm(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to start simulation');
      },
    }
  );

  // Cancel simulation mutation
  const cancelSimulationMutation = useMutation(
    (id: string) => apiService.cancelSimulation(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['simulations']);
        toast.success('Simulation cancelled successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to cancel simulation');
      },
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setTimeout(() => {
      setFilters(prev => ({ ...prev, search: event.target.value }));
    }, 500);
  };

  const handleFilterChange = (newFilters: Partial<SimulationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  const handleStartSimulation = () => {
    setSelectedSimulation(null);
    setShowForm(true);
  };

  const handleViewSimulation = (simulation: SimulationRun) => {
    setSelectedSimulation(simulation);
    setShowDetails(true);
  };

  const handleCancelSimulation = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this simulation?')) {
      cancelSimulationMutation.mutate(id);
    }
  };

  const handleSaveSimulation = (config: any) => {
    startSimulationMutation.mutate(config);
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success('Export started');
  };

  const tabs = [
    { label: 'All Simulations', value: 0 },
    { label: 'Running', value: 1 },
    { label: 'Completed', value: 2 },
    { label: 'Failed', value: 3 },
  ];

  const getTabFilters = (tabValue: number) => {
    switch (tabValue) {
      case 1:
        return { status: 'Running' as const };
      case 2:
        return { status: 'Completed' as const };
      case 3:
        return { status: 'Failed' as const };
      default:
        return {};
    }
  };

  const handleTabClick = (tabValue: number) => {
    const tabFilters = getTabFilters(tabValue);
    setFilters(prev => ({ ...prev, ...tabFilters, page: 1 }));
  };

  // Get running simulations count
  const runningCount = simulationsData?.data?.filter(s => s.status === 'Running').length || 0;

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon />
            Simulation Management
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Configure and monitor catastrophe modeling simulations
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ textTransform: 'none' }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={handleStartSimulation}
            sx={{ textTransform: 'none' }}
          >
            Start Simulation
          </Button>
        </Box>
      </Box>

      {/* Running Simulations Alert */}
      {runningCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card sx={{ mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.04)', border: '1px solid rgba(25, 118, 210, 0.2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PlayIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {runningCount} simulation{runningCount > 1 ? 's' : ''} currently running
                </Typography>
                <Chip label="Live" color="primary" size="small" />
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search simulations..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ textTransform: 'none' }}
          >
            Filters
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              onClick={() => handleTabClick(tab.value)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <SimulationList
          simulations={simulationsData?.data || []}
          loading={isLoading}
          onView={handleViewSimulation}
          onCancel={handleCancelSimulation}
          pagination={simulationsData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <SimulationList
          simulations={simulationsData?.data || []}
          loading={isLoading}
          onView={handleViewSimulation}
          onCancel={handleCancelSimulation}
          pagination={simulationsData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <SimulationList
          simulations={simulationsData?.data || []}
          loading={isLoading}
          onView={handleViewSimulation}
          onCancel={handleCancelSimulation}
          pagination={simulationsData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <SimulationList
          simulations={simulationsData?.data || []}
          loading={isLoading}
          onView={handleViewSimulation}
          onCancel={handleCancelSimulation}
          pagination={simulationsData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      {/* Forms and Modals */}
      {showForm && (
        <SimulationForm
          simulation={selectedSimulation}
          open={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSaveSimulation}
        />
      )}

      {showDetails && selectedSimulation && (
        <SimulationDetails
          simulation={selectedSimulation}
          open={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </Box>
  );
};

export default SimulationsPage;

