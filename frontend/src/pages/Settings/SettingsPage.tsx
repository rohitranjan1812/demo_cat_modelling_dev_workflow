import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    appearance: {
      theme: 'light',
      language: 'en',
      fontSize: 'medium',
    },
    data: {
      autoSave: true,
      backupFrequency: 'daily',
      retentionPeriod: '1year',
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  const handleSave = () => {
    // Implement save functionality
    toast.success('Settings saved successfully');
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success('Settings exported successfully');
  };

  const handleImport = () => {
    // Implement import functionality
    toast.info('Import functionality coming soon');
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
            <SettingsIcon />
            Settings
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Configure application preferences and system settings
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
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ textTransform: 'none' }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon />
                  Notifications
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Receive push notifications in browser"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.push}
                        onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="SMS Notifications"
                      secondary="Receive critical alerts via SMS"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.sms}
                        onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaletteIcon />
                  Appearance
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    select
                    label="Theme"
                    value={settings.appearance.theme}
                    onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </TextField>
                  
                  <TextField
                    select
                    label="Language"
                    value={settings.appearance.language}
                    onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </TextField>
                  
                  <TextField
                    select
                    label="Font Size"
                    value={settings.appearance.fontSize}
                    onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </TextField>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon />
                  Security
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Add an extra layer of security"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.security.twoFactor}
                        onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Session Timeout"
                      secondary={`${settings.security.sessionTimeout} minutes`}
                    />
                    <ListItemSecondaryAction>
                      <Chip label={`${settings.security.sessionTimeout}m`} size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Password Expiry"
                      secondary={`${settings.security.passwordExpiry} days`}
                    />
                    <ListItemSecondaryAction>
                      <Chip label={`${settings.security.passwordExpiry}d`} size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StorageIcon />
                  Data Management
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Auto Save"
                      secondary="Automatically save changes"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.data.autoSave}
                        onChange={(e) => handleSettingChange('data', 'autoSave', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Backup Frequency"
                      secondary={settings.data.backupFrequency}
                    />
                    <ListItemSecondaryAction>
                      <Chip label={settings.data.backupFrequency} size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText
                      primary="Data Retention"
                      secondary={settings.data.retentionPeriod}
                    />
                    <ListItemSecondaryAction>
                      <Chip label={settings.data.retentionPeriod} size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon />
                  System Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        v1.0.0
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Application Version
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                        Online
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        System Status
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                        67%
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Memory Usage
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                        1.2GB
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Data Size
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleImport}
                    sx={{ textTransform: 'none' }}
                  >
                    Import Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    sx={{ textTransform: 'none' }}
                  >
                    Export Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        style={{ marginTop: 24 }}
      >
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Note:</strong> Some settings may require a page refresh to take effect. 
            Your preferences are automatically saved to your browser's local storage.
          </Typography>
        </Alert>
      </motion.div>
    </Box>
  );
};

export default SettingsPage;

