import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  CheckCircle as CompletedIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import apiService from '../../services/api';

const RecentSimulations: React.FC = () => {
  const navigate = useNavigate();

  const { data: simulationsData, isLoading } = useQuery(
    'recentSimulations',
    () => apiService.getSimulationRuns({ limit: 5, page: 1 }),
    {
      refetchInterval: 30000,
    }
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CompletedIcon color="success" />;
      case 'Running':
        return <PlayIcon color="primary" />;
      case 'Failed':
        return <ErrorIcon color="error" />;
      case 'Cancelled':
        return <CancelledIcon color="warning" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Running':
        return 'primary';
      case 'Failed':
        return 'error';
      case 'Cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (duration: number) => {
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrendingUpIcon />
            Recent Simulations
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/simulations')}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ py: 2 }}>
            <LinearProgress />
          </Box>
        ) : simulationsData?.data && simulationsData.data.length > 0 ? (
          <List sx={{ p: 0 }}>
            {simulationsData.data.map((simulation: any, index: number) => (
              <motion.div
                key={simulation._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    px: 0,
                    py: 1.5,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/simulations/${simulation.simulationRunId}`)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getStatusIcon(simulation.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: '#1976d2',
                          mb: 0.5,
                        }}
                      >
                        {simulation.simulationName}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5,
                          }}
                        >
                          {formatDate(simulation.startTime)}
                          {simulation.duration && ` • ${formatDuration(simulation.duration)}`}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={simulation.status}
                            size="small"
                            color={getStatusColor(simulation.status) as any}
                            variant="outlined"
                          />
                          {simulation.progress !== undefined && simulation.status === 'Running' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={simulation.progress}
                                sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                              />
                              <Typography variant="caption" sx={{ minWidth: 35 }}>
                                {Math.round(simulation.progress)}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < (simulationsData?.data?.length ?? 0) - 1 && <Divider sx={{ my: 1 }} />}
              </motion.div>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              No recent simulations
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={() => navigate('/simulations')}
              sx={{ textTransform: 'none' }}
            >
              Start Simulation
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSimulations;

