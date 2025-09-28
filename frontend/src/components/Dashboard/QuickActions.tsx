import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Assessment as AssessmentIcon,
  Map as MapIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'New Simulation',
      description: 'Start a new catastrophe simulation',
      icon: <PlayIcon />,
      color: '#9c27b0',
      onClick: () => navigate('/simulations'),
    },
    {
      title: 'Add Hazard',
      description: 'Create a new hazard event',
      icon: <WarningIcon />,
      color: '#ff9800',
      onClick: () => navigate('/hazards'),
    },
    {
      title: 'Risk Assessment',
      description: 'Perform location risk analysis',
      icon: <AssessmentIcon />,
      color: '#4caf50',
      onClick: () => navigate('/integration'),
    },
    {
      title: 'View Map',
      description: 'Interactive hazard mapping',
      icon: <MapIcon />,
      color: '#2196f3',
      onClick: () => navigate('/maps'),
    },
  ];

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
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <AddIcon />
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} key={action.title}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={action.onClick}
                  sx={{
                    p: 2,
                    height: 'auto',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    border: `2px solid ${action.color}20`,
                    borderRadius: 2,
                    backgroundColor: `${action.color}05`,
                    '&:hover': {
                      backgroundColor: `${action.color}10`,
                      borderColor: action.color,
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: action.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: '#1976d2',
                        flexGrow: 1,
                      }}
                    >
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {action.description}
                  </Typography>
                </Button>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Recent Activity
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="Simulation completed"
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              label="New hazard detected"
              size="small"
              color="warning"
              variant="outlined"
            />
            <Chip
              label="Risk alert"
              size="small"
              color="error"
              variant="outlined"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActions;

