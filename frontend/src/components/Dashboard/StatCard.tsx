import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
} from '@mui/material';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color,
  suffix = '',
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return '#4caf50';
      case 'negative':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
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
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                backgroundColor: color,
                width: 48,
                height: 48,
                boxShadow: `0 4px 12px ${color}40`,
              }}
            >
              {icon}
            </Avatar>
            {change && (
              <Chip
                label={`${getChangeIcon()} ${change}`}
                size="small"
                sx={{
                  backgroundColor: `${getChangeColor()}15`,
                  color: getChangeColor(),
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1976d2',
              mb: 0.5,
              fontSize: '2rem',
            }}
          >
            {value}{suffix}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;

