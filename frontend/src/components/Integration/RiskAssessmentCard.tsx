import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { RiskAssessment } from '../../types';

interface RiskAssessmentCardProps {
  riskAssessment: RiskAssessment;
  loading: boolean;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ riskAssessment, loading }) => {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Very High':
        return '#d32f2f';
      case 'High':
        return '#f44336';
      case 'Medium':
        return '#ff9800';
      case 'Low':
        return '#4caf50';
      case 'Very Low':
        return '#8bc34a';
      default:
        return '#9e9e9e';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return '#d32f2f';
    if (score >= 60) return '#f44336';
    if (score >= 40) return '#ff9800';
    if (score >= 20) return '#4caf50';
    return '#8bc34a';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading risk assessment...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 3, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <AssessmentIcon />
            Risk Assessment Results
          </Typography>

          <Grid container spacing={3}>
            {/* Risk Score */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: getRiskScoreColor(riskAssessment.riskScore), mb: 1 }}>
                  {riskAssessment.riskScore}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Risk Score
                </Typography>
                <Chip
                  label={riskAssessment.riskLevel}
                  sx={{
                    backgroundColor: `${getRiskLevelColor(riskAssessment.riskLevel)}15`,
                    color: getRiskLevelColor(riskAssessment.riskLevel),
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Grid>

            {/* Location Info */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="primary" />
                  Location
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Address:</strong> {riskAssessment.location.address || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Coordinates:</strong> {riskAssessment.location.latitude.toFixed(4)}, {riskAssessment.location.longitude.toFixed(4)}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {new Date(riskAssessment.lastUpdated).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>

            {/* Risk Level Indicator */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  Risk Level
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Risk Score</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {riskAssessment.riskScore}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={riskAssessment.riskScore}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getRiskScoreColor(riskAssessment.riskScore),
                      },
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Hazards */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="primary" />
                  Identified Hazards ({riskAssessment.hazards.length})
                </Typography>
                <List dense>
                  {riskAssessment.hazards.slice(0, 5).map((hazard, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <WarningIcon fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={hazard.hazardName}
                        secondary={`${hazard.hazardType} - ${hazard.severity}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                  {riskAssessment.hazards.length > 5 && (
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={`+${riskAssessment.hazards.length - 5} more hazards`}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Grid>

            {/* Vulnerabilities */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="primary" />
                  Vulnerabilities ({riskAssessment.vulnerabilities.length})
                </Typography>
                <List dense>
                  {riskAssessment.vulnerabilities.slice(0, 5).map((vulnerability, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <SecurityIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={vulnerability.vulnerabilityName}
                        secondary={`${vulnerability.vulnerabilityType} - ${vulnerability.overallRiskLevel}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                  {riskAssessment.vulnerabilities.length > 5 && (
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={`+${riskAssessment.vulnerabilities.length - 5} more vulnerabilities`}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Grid>

            {/* Recommendations */}
            {riskAssessment.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon color="primary" />
                    Recommendations
                  </Typography>
                  <List dense>
                    {riskAssessment.recommendations.map((recommendation, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <AssessmentIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={recommendation}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RiskAssessmentCard;

