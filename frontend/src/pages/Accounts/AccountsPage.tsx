import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import apiService from '../../services/api';
import { Account } from '../../types';

const AccountsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const queryClient = useQueryClient();

  // Fetch accounts data
  const { data: accountsData, isLoading, refetch } = useQuery(
    'accounts',
    () => apiService.getAccounts(),
    {
      keepPreviousData: true,
    }
  );

  // Delete account mutation
  const deleteAccountMutation = useMutation(
    (id: string) => apiService.deleteAccount(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['accounts']);
        toast.success('Account deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete account');
      },
    }
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  const handleAddAccount = () => {
    // Implement add account functionality
    toast.info('Add account functionality coming soon');
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    // Implement edit account functionality
    toast.info('Edit account functionality coming soon');
  };

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    // Implement view account functionality
    toast.info('View account functionality coming soon');
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteAccountMutation.mutate(id);
    }
  };

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'Individual':
        return <HomeIcon />;
      case 'Corporate':
        return <BusinessIcon />;
      case 'Government':
        return <GavelIcon />;
      case 'NGO':
        return <PeopleIcon />;
      default:
        return <AccountBalanceIcon />;
    }
  };

  const getAccountTypeColor = (accountType: string) => {
    switch (accountType) {
      case 'Individual':
        return '#4caf50';
      case 'Corporate':
        return '#2196f3';
      case 'Government':
        return '#ff9800';
      case 'NGO':
        return '#9c27b0';
      default:
        return '#9e9e9e';
    }
  };

  const filteredAccounts = accountsData?.data?.filter(account =>
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
            <PeopleIcon />
            Account Management
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage user accounts and policy information
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
            sx={{ textTransform: 'none' }}
          >
            Add Account
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search accounts..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      </Paper>

      {/* Accounts Grid */}
      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading accounts...</Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : filteredAccounts.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No accounts found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria or add a new account.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredAccounts.map((account, index) => (
            <Grid item xs={12} sm={6} md={4} key={account._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: getAccountTypeColor(account.accountType),
                          width: 48,
                          height: 48,
                        }}
                      >
                        {getAccountTypeIcon(account.accountType)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                          {account.accountName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {account.accountId}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewAccount(account)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditAccount(account)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAccount(account._id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Chip
                      label={account.accountType}
                      size="small"
                      sx={{
                        backgroundColor: `${getAccountTypeColor(account.accountType)}15`,
                        color: getAccountTypeColor(account.accountType),
                        fontWeight: 600,
                        mb: 2,
                      }}
                    />

                    <List dense>
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <AccountBalanceIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary={account.contactInfo.email}
                          primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <AccountBalanceIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Location"
                          secondary={`${account.contactInfo.address.city}, ${account.contactInfo.address.country}`}
                          primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <AccountBalanceIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Exposure"
                          secondary={`${account.riskProfile.totalExposure.toLocaleString()} ${account.riskProfile.currency}`}
                          primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={account.status}
                        size="small"
                        color={account.status === 'Active' ? 'success' : 'default'}
                        variant="outlined"
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {account.policies.length} policies
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default AccountsPage;

