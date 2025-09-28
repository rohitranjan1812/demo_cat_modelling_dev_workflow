import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const RiskComparisonChart: React.FC = () => {
  // Sample data for demonstration
  const riskTrendData = [
    { year: '2020', earthquake: 45, hurricane: 32, flood: 28, wildfire: 15 },
    { year: '2021', earthquake: 48, hurricane: 35, flood: 31, wildfire: 18 },
    { year: '2022', earthquake: 52, hurricane: 38, flood: 35, wildfire: 22 },
    { year: '2023', earthquake: 55, hurricane: 42, flood: 38, wildfire: 25 },
    { year: '2024', earthquake: 58, hurricane: 45, flood: 42, wildfire: 28 },
  ];

  const regionalRiskData = [
    { region: 'North America', risk: 65, exposure: 1200000, events: 45 },
    { region: 'Europe', risk: 42, exposure: 850000, events: 28 },
    { region: 'Asia Pacific', risk: 78, exposure: 2100000, events: 67 },
    { region: 'Latin America', risk: 55, exposure: 650000, events: 34 },
    { region: 'Middle East', risk: 38, exposure: 420000, events: 19 },
    { region: 'Africa', risk: 48, exposure: 380000, events: 23 },
  ];

  const hazardDistributionData = [
    { name: 'Earthquake', value: 35, color: '#f44336' },
    { name: 'Hurricane', value: 25, color: '#ff9800' },
    { name: 'Flood', value: 20, color: '#2196f3' },
    { name: 'Wildfire', value: 12, color: '#ff5722' },
    { name: 'Other', value: 8, color: '#9e9e9e' },
  ];

  const [chartType, setChartType] = React.useState('trend');

  const handleChartTypeChange = (event: any) => {
    setChartType(event.target.value);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="earthquake" stroke="#f44336" strokeWidth={2} name="Earthquake" />
              <Line type="monotone" dataKey="hurricane" stroke="#ff9800" strokeWidth={2} name="Hurricane" />
              <Line type="monotone" dataKey="flood" stroke="#2196f3" strokeWidth={2} name="Flood" />
              <Line type="monotone" dataKey="wildfire" stroke="#ff5722" strokeWidth={2} name="Wildfire" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'regional':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionalRiskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="risk" fill="#1976d2" name="Risk Score" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={hazardDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {hazardDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <TrendingUpIcon />
              Risk Comparison & Analysis
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={handleChartTypeChange}
              >
                <MenuItem value="trend">Risk Trends</MenuItem>
                <MenuItem value="regional">Regional Risk</MenuItem>
                <MenuItem value="distribution">Hazard Distribution</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {renderChart()}

          {/* Summary Stats */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Summary Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f44336' }}>
                    {chartType === 'trend' ? '58' : chartType === 'regional' ? '78' : '35%'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {chartType === 'trend' ? 'Current Risk Score' : chartType === 'regional' ? 'Highest Regional Risk' : 'Earthquake Risk'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                    {chartType === 'trend' ? '+13%' : chartType === 'regional' ? '6' : '25%'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {chartType === 'trend' ? 'YoY Change' : chartType === 'regional' ? 'Regions Analyzed' : 'Hurricane Risk'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                    {chartType === 'trend' ? '42' : chartType === 'regional' ? '2.1M' : '20%'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {chartType === 'trend' ? 'Average Risk' : chartType === 'regional' ? 'Total Exposure' : 'Flood Risk'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {chartType === 'trend' ? '28' : chartType === 'regional' ? '216' : '12%'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {chartType === 'trend' ? 'Wildfire Risk' : chartType === 'regional' ? 'Total Events' : 'Wildfire Risk'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Risk Level Indicators */}
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              icon={<WarningIcon />}
              label="High Risk Areas: 3"
              color="error"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<TrendingUpIcon />}
              label="Increasing Trend: 2"
              color="warning"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<AssessmentIcon />}
              label="Monitoring: 4"
              color="info"
              variant="outlined"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RiskComparisonChart;

