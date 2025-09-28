import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
  Typography,
  Avatar,
  LinearProgress,
  TablePagination,
  Tooltip,
  Button,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  Error as ErrorIcon,
  Cancel as CancelledIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { SimulationRun, PaginationInfo } from '../../types';

interface SimulationListProps {
  simulations: SimulationRun[];
  loading: boolean;
  onView: (simulation: SimulationRun) => void;
  onCancel: (id: string) => void;
  pagination?: PaginationInfo;
  onPageChange: (page: number) => void;
}

const SimulationList: React.FC<SimulationListProps> = ({
  simulations,
  loading,
  onView,
  onCancel,
  pagination,
  onPageChange,
}) => {
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
        return <ScheduleIcon color="action" />;
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
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatDuration = (duration: number) => {
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading simulations...</Typography>
      </Paper>
    );
  }

  if (simulations.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          No simulations found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start a new simulation to begin risk assessment.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
              <TableCell sx={{ fontWeight: 600 }}>Simulation</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Hazard Types</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 100 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {simulations.map((simulation, index) => (
              <motion.tr
                key={simulation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{ display: 'table-row' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: '#9c27b0',
                        width: 40,
                        height: 40,
                      }}
                    >
                      <AssessmentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {simulation.simulationName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {simulation.simulationRunId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(simulation.status)}
                    <Chip
                      label={simulation.status}
                      size="small"
                      color={getStatusColor(simulation.status) as any}
                      variant="outlined"
                    />
                  </Box>
                </TableCell>

                <TableCell>
                  {simulation.status === 'Running' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={simulation.progress || 0}
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" sx={{ minWidth: 35 }}>
                        {Math.round(simulation.progress || 0)}%
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {simulation.status === 'Completed' ? '100%' : 'N/A'}
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {simulation.configuration.hazardTypes.slice(0, 2).map((hazardType) => (
                      <Chip
                        key={hazardType}
                        label={hazardType}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {simulation.configuration.hazardTypes.length > 2 && (
                      <Chip
                        label={`+${simulation.configuration.hazardTypes.length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {simulation.duration ? formatDuration(simulation.duration) : 'N/A'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatDate(simulation.startTime)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onView(simulation)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {simulation.status === 'Running' && (
                      <Tooltip title="Cancel Simulation">
                        <IconButton
                          size="small"
                          onClick={() => onCancel(simulation.simulationRunId)}
                          sx={{ color: 'error.main' }}
                        >
                          <StopIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={(event, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={() => {}} // Handle if needed
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      )}
    </Paper>
  );
};

export default SimulationList;

