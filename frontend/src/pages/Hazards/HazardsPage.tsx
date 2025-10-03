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
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import apiService from '../../services/api';
import HazardList from '../../components/Hazards/HazardList';
import HazardForm from '../../components/Hazards/HazardForm';
import HazardDetails from '../../components/Hazards/HazardDetails';
import HazardFilters from '../../components/Hazards/HazardFilters';
import { Hazard, HazardFilters as HazardFiltersType } from '../../types';

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
      id={`hazard-tabpanel-${index}`}
      aria-labelledby={`hazard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const HazardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<HazardFiltersType>({
    page: 1,
    limit: 10,
    status: 'Active',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch hazards data
  const { data: hazardsData, isLoading, refetch } = useQuery(
    ['hazards', filters],
    () => apiService.getHazards(filters),
    {
      keepPreviousData: true,
    }
  );

  // Create hazard mutation
  const createHazardMutation = useMutation(
    (hazard: Partial<Hazard>) => apiService.createHazard(hazard),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['hazards']);
        toast.success('Hazard created successfully');
        setShowForm(false);
        setSelectedHazard(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create hazard');
      },
    }
  );

  // Update hazard mutation
  const updateHazardMutation = useMutation(
    ({ id, hazard }: { id: string; hazard: Partial<Hazard> }) => 
      apiService.updateHazard(id, hazard),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['hazards']);
        toast.success('Hazard updated successfully');
        setShowForm(false);
        setSelectedHazard(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update hazard');
      },
    }
  );

  // Delete hazard mutation
  const deleteHazardMutation = useMutation(
    (id: string) => apiService.deleteHazard(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['hazards']);
        toast.success('Hazard deleted successfully');
        setAnchorEl(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete hazard');
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

  const handleFilterChange = (newFilters: Partial<HazardFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  const handleAddHazard = () => {
    setSelectedHazard(null);
    setShowForm(true);
  };

  const handleEditHazard = (hazard: Hazard) => {
    setSelectedHazard(hazard);
    setShowForm(true);
  };

  const handleViewHazard = (hazard: Hazard) => {
    setSelectedHazard(hazard);
    setShowDetails(true);
  };

  const handleSaveHazard = (hazardData: Partial<Hazard>) => {
    if (selectedHazard) {
      // Update existing hazard
      updateHazardMutation.mutate({ 
        id: selectedHazard._id || selectedHazard.hazardId, 
        hazard: hazardData 
      });
    } else {
      // Create new hazard
      createHazardMutation.mutate(hazardData);
    }
  };

  const handleDeleteHazard = (id: string) => {
    if (window.confirm('Are you sure you want to delete this hazard?')) {
      deleteHazardMutation.mutate(id);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, hazardId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedHazardId(hazardId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedHazardId(null);
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success('Export started');
  };

  const tabs = [
    { label: 'All Hazards', value: 0 },
    { label: 'Active', value: 1 },
    { label: 'Historical', value: 2 },
    { label: 'Simulated', value: 3 },
  ];

  const getTabFilters = (tabValue: number) => {
    switch (tabValue) {
      case 1:
        return { status: 'Active' as const };
      case 2:
        return { isHistorical: true };
      case 3:
        return { isSimulated: true };
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
            <WarningIcon />
            Hazard Management
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage and monitor hazard events, zones, and scenarios
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
            onClick={handleAddHazard}
            sx={{ textTransform: 'none' }}
          >
            Add Hazard
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search hazards..."
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
            <HazardFilters
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
        <HazardList
          hazards={hazardsData?.data || []}
          loading={isLoading}
          onEdit={handleEditHazard}
          onView={handleViewHazard}
          onDelete={handleDeleteHazard}
          onMenuOpen={handleMenuOpen}
          pagination={hazardsData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <HazardList
          hazards={hazardsData?.data || []}
          loading={isLoading}
          onEdit={handleEditHazard}
          onView={handleViewHazard}
          onDelete={handleDeleteHazard}
          onMenuOpen={handleMenuOpen}
          pagination={hazardsData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <HazardList
          hazards={hazardsData?.data || []}
          loading={isLoading}
          onEdit={handleEditHazard}
          onView={handleViewHazard}
          onDelete={handleDeleteHazard}
          onMenuOpen={handleMenuOpen}
          pagination={hazardsData?.pagination}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <HazardList
          hazards={hazardsData?.data || []}
          loading={isLoading}
          onEdit={handleEditHazard}
          onView={handleViewHazard}
          onDelete={handleDeleteHazard}
          onMenuOpen={handleMenuOpen}
          pagination={hazardsData?.pagination}
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
          const hazard = hazardsData?.data?.find(h => h._id === selectedHazardId);
          if (hazard) handleViewHazard(hazard);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const hazard = hazardsData?.data?.find(h => h._id === selectedHazardId);
          if (hazard) handleEditHazard(hazard);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedHazardId) handleDeleteHazard(selectedHazardId);
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
        <HazardForm
          hazard={selectedHazard}
          open={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSaveHazard}
        />
      )}

      {showDetails && selectedHazard && (
        <HazardDetails
          hazard={selectedHazard}
          open={showDetails}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            handleEditHazard(selectedHazard);
          }}
        />
      )}
    </Box>
  );
};

export default HazardsPage;

