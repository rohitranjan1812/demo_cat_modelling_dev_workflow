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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import apiService from '../../services/api';
import VulnerabilityList from '../../components/Vulnerabilities/VulnerabilityList';
import VulnerabilityForm from '../../components/Vulnerabilities/VulnerabilityForm';
import VulnerabilityDetails from '../../components/Vulnerabilities/VulnerabilityDetails';
import VulnerabilityFilters from '../../components/Vulnerabilities/VulnerabilityFilters';
import { Vulnerability, VulnerabilityFilters as VulnerabilityFiltersType } from '../../types';

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
      id={`vulnerability-tabpanel-${index}`}
      aria-labelledby={`vulnerability-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VulnerabilitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<VulnerabilityFiltersType>({
    page: 1,
    limit: 10,
    status: 'Active',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVulnerabilityId, setSelectedVulnerabilityId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch vulnerabilities data
  const { data: vulnerabilitiesData, isLoading, refetch } = useQuery(
    ['vulnerabilities', filters],
    () => apiService.getVulnerabilities(filters),
    {
      keepPreviousData: true,
    }
  );

  // Create vulnerability mutation
  const createVulnerabilityMutation = useMutation(
    (vulnerability: Partial<Vulnerability>) => apiService.createVulnerability(vulnerability),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vulnerabilities']);
        toast.success('Vulnerability created successfully');
        setShowForm(false);
        setSelectedVulnerability(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create vulnerability');
      },
    }
  );

  // Update vulnerability mutation
  const updateVulnerabilityMutation = useMutation(
    ({ id, vulnerability }: { id: string; vulnerability: Partial<Vulnerability> }) => 
      apiService.updateVulnerability(id, vulnerability),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vulnerabilities']);
        toast.success('Vulnerability updated successfully');
        setShowForm(false);
        setSelectedVulnerability(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update vulnerability');
      },
    }
  );

  // Delete vulnerability mutation
  const deleteVulnerabilityMutation = useMutation(
    (id: string) => apiService.deleteVulnerability(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['vulnerabilities']);
        toast.success('Vulnerability deleted successfully');
        setAnchorEl(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete vulnerability');
      },
    }
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Debounce search
    setTimeout(() => {
      setFilters(prev => ({ ...prev, search: event.target.value }));
    }, 500);
  };

  const handleFilterChange = (newFilters: Partial<VulnerabilityFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  const handleAddVulnerability = () => {
    setSelectedVulnerability(null);
    setShowForm(true);
  };

  const handleEditVulnerability = (vulnerability: Vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setShowForm(true);
  };

  const handleViewVulnerability = (vulnerability: Vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setShowDetails(true);
  };

  const handleSaveVulnerability = (vulnerabilityData: Partial<Vulnerability>) => {
    if (selectedVulnerability) {
      // Update existing vulnerability
      updateVulnerabilityMutation.mutate({ 
        id: selectedVulnerability._id || selectedVulnerability.vulnerabilityId, 
        vulnerability: vulnerabilityData 
      });
    } else {
      // Create new vulnerability
      createVulnerabilityMutation.mutate(vulnerabilityData);
    }
  };

  const handleDeleteVulnerability = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vulnerability?')) {
      deleteVulnerabilityMutation.mutate(id);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, vulnerabilityId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedVulnerabilityId(vulnerabilityId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVulnerabilityId(null);
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success('Export started');
  };

  const tabs = [
    { label: 'All Vulnerabilities', value: 0 },
    { label: 'High Risk', value: 1 },
    { label: 'Medium Risk', value: 2 },
    { label: 'Low Risk', value: 3 },
  ];

  const getTabFilters = (tabValue: number) => {
    switch (tabValue) {
      case 1:
        return { overallRiskLevel: 'High' as const };
      case 2:
        return { overallRiskLevel: 'Medium' as const };
      case 3:
        return { overallRiskLevel: 'Low' as const };
      default:
        return {};
    }
  };

  const handleTabClick = (tabValue: number) => {
    const tabFilters = getTabFilters(tabValue);
    setFilters(prev => ({ ...prev, ...tabFilters, page: 1 }));
  };

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
            <SecurityIcon />
            Vulnerability Management
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Assess and manage vulnerability risks and mitigation strategies
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
            startIcon={<AddIcon />}
            onClick={handleAddVulnerability}
            sx={{ textTransform: 'none' }}
          >
            Add Vulnerability
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search vulnerabilities..."
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
            onClick={() => setShowFilters(!showFilters)}
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

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <VulnerabilityFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </motion.div>
        )}
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
        <VulnerabilityList
          vulnerabilities={vulnerabilitiesData?.data || []}
          loading={isLoading}
          onEdit={handleEditVulnerability}
          onView={handleViewVulnerability}
          onDelete={handleDeleteVulnerability}
          onMenuOpen={handleMenuOpen}
          pagination={vulnerabilitiesData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <VulnerabilityList
          vulnerabilities={vulnerabilitiesData?.data || []}
          loading={isLoading}
          onEdit={handleEditVulnerability}
          onView={handleViewVulnerability}
          onDelete={handleDeleteVulnerability}
          onMenuOpen={handleMenuOpen}
          pagination={vulnerabilitiesData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <VulnerabilityList
          vulnerabilities={vulnerabilitiesData?.data || []}
          loading={isLoading}
          onEdit={handleEditVulnerability}
          onView={handleViewVulnerability}
          onDelete={handleDeleteVulnerability}
          onMenuOpen={handleMenuOpen}
          pagination={vulnerabilitiesData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <VulnerabilityList
          vulnerabilities={vulnerabilitiesData?.data || []}
          loading={isLoading}
          onEdit={handleEditVulnerability}
          onView={handleViewVulnerability}
          onDelete={handleDeleteVulnerability}
          onMenuOpen={handleMenuOpen}
          pagination={vulnerabilitiesData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 150,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem onClick={() => {
          const vulnerability = vulnerabilitiesData?.data?.find(v => v._id === selectedVulnerabilityId);
          if (vulnerability) handleViewVulnerability(vulnerability);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const vulnerability = vulnerabilitiesData?.data?.find(v => v._id === selectedVulnerabilityId);
          if (vulnerability) handleEditVulnerability(vulnerability);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedVulnerabilityId) handleDeleteVulnerability(selectedVulnerabilityId);
          handleMenuClose();
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Forms and Modals */}
      {showForm && (
        <VulnerabilityForm
          vulnerability={selectedVulnerability}
          open={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSaveVulnerability}
        />
      )}

      {showDetails && selectedVulnerability && (
        <VulnerabilityDetails
          vulnerability={selectedVulnerability}
          open={showDetails}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            handleEditVulnerability(selectedVulnerability);
          }}
        />
      )}
    </Box>
  );
};

export default VulnerabilitiesPage;

