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
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { Hazard, PaginationInfo } from '../../types';

interface HazardListProps {
  hazards: Hazard[];
  loading: boolean;
  onEdit: (hazard: Hazard) => void;
  onView: (hazard: Hazard) => void;
  onDelete: (id: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, hazardId: string) => void;
  pagination?: PaginationInfo;
  onPageChange: (page: number) => void;
}

const HazardList: React.FC<HazardListProps> = ({
  hazards,
  loading,
  onEdit,
  onView,
  onDelete,
  onMenuOpen,
  pagination,
  onPageChange,
}) => {
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'Minor': '#4caf50',
      'Moderate': '#ff9800',
      'Major': '#ff5722',
      'Severe': '#f44336',
      'Catastrophic': '#d32f2f',
      'Extreme': '#b71c1c',
    };
    return colors[severity] || '#9e9e9e';
  };

  const getHazardTypeIcon = (hazardType: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Earthquake': <WarningIcon />,
      'Hurricane': <TrendingUpIcon />,
      'Flood': <LocationIcon />,
      'Wildfire': <WarningIcon />,
      'Tornado': <TrendingUpIcon />,
      'Tsunami': <LocationIcon />,
    };
    return icons[hazardType] || <WarningIcon />;
  };

  const getHazardTypeColor = (hazardType: string) => {
    const colors: Record<string, string> = {
      'Earthquake': '#f44336',
      'Hurricane': '#ff9800',
      'Flood': '#2196f3',
      'Wildfire': '#ff5722',
      'Tornado': '#9c27b0',
      'Tsunami': '#00bcd4',
    };
    return colors[hazardType] || '#9e9e9e';
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading hazards...</Typography>
      </Paper>
    );
  }

  if (hazards.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <WarningIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          No hazards found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search criteria or add a new hazard.
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
              <TableCell sx={{ fontWeight: 600 }}>Hazard</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Probability</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Impact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Regions</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 50 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hazards.map((hazard, index) => (
              <motion.tr
                key={hazard._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{ display: 'table-row' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: getHazardTypeColor(hazard.hazardType),
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getHazardTypeIcon(hazard.hazardType)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                        {hazard.hazardName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {hazard.hazardId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={hazard.hazardType}
                    size="small"
                    sx={{
                      backgroundColor: `${getHazardTypeColor(hazard.hazardType)}15`,
                      color: getHazardTypeColor(hazard.hazardType),
                      fontWeight: 600,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={hazard.severity}
                    size="small"
                    sx={{
                      backgroundColor: `${getSeverityColor(hazard.severity)}15`,
                      color: getSeverityColor(hazard.severity),
                      fontWeight: 600,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {(hazard.probability * 100).toFixed(1)}%
                    </Typography>
                    <Box sx={{ width: 60, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
                      <Box
                        sx={{
                          width: `${hazard.probability * 100}%`,
                          height: '100%',
                          backgroundColor: getSeverityColor(hazard.severity),
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {hazard.economicImpact && hazard.economicImpact.length > 0 
                      ? formatCurrency(hazard.economicImpact[0].estimatedLoss || 0, hazard.economicImpact[0].currency || 'USD')
                      : 'N/A'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {hazard.footprint.affectedArea?.toLocaleString() || 'N/A'} km²
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {hazard.affectedRegions.slice(0, 2).map((region) => (
                      <Chip
                        key={region}
                        label={region}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {hazard.affectedRegions.length > 2 && (
                      <Chip
                        label={`+${hazard.affectedRegions.length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={hazard.status}
                    size="small"
                    color={hazard.status === 'Active' ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatDate(hazard.createdAt)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Tooltip title="More actions">
                    <IconButton
                      size="small"
                      onClick={(event) => onMenuOpen(event, hazard._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
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

export default HazardList;

