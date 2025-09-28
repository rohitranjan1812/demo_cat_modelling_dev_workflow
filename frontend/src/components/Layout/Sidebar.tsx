import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warning as HazardsIcon,
  Security as VulnerabilitiesIcon,
  PlayArrow as SimulationsIcon,
  Integration as IntegrationIcon,
  People as AccountsIcon,
  Settings as SettingsIcon,
  TrendingUp as AnalyticsIcon,
  Map as MapIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface SidebarProps {
  onItemClick?: () => void;
}

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    color: '#4caf50',
  },
  {
    text: 'Hazards',
    icon: <HazardsIcon />,
    path: '/hazards',
    color: '#ff9800',
    badge: '12',
  },
  {
    text: 'Vulnerabilities',
    icon: <VulnerabilitiesIcon />,
    path: '/vulnerabilities',
    color: '#f44336',
    badge: '8',
  },
  {
    text: 'Simulations',
    icon: <SimulationsIcon />,
    path: '/simulations',
    color: '#9c27b0',
    badge: '3',
  },
  {
    text: 'Integration',
    icon: <IntegrationIcon />,
    path: '/integration',
    color: '#2196f3',
  },
  {
    text: 'Accounts',
    icon: <AccountsIcon />,
    path: '/accounts',
    color: '#607d8b',
  },
];

const secondaryItems = [
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    color: '#795548',
  },
  {
    text: 'Maps',
    icon: <MapIcon />,
    path: '/maps',
    color: '#009688',
  },
  {
    text: 'Reports',
    icon: <ReportsIcon />,
    path: '/reports',
    color: '#ff5722',
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    color: '#9e9e9e',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleItemClick = (path: string) => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CAT Platform
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}
          >
            Risk Assessment & Simulation
          </Typography>
        </motion.div>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, py: 1 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.7)',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.9)',
                        fontWeight: isActive(item.path) ? 600 : 400,
                        fontSize: '0.9rem',
                      },
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        backgroundColor: item.color,
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </motion.div>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

        {/* Secondary Navigation */}
        <List sx={{ px: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.5)',
              px: 2,
              py: 1,
              display: 'block',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Tools & Reports
          </Typography>
          {secondaryItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (menuItems.length + index) * 0.1 }}
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.6)',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.8)',
                        fontWeight: isActive(item.path) ? 600 : 400,
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.7rem',
          }}
        >
          v1.0.0 • CAT Modeling Platform
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;

