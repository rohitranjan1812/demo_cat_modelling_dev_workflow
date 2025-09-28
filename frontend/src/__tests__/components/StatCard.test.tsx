import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import StatCard from '../../components/Dashboard/StatCard';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('StatCard', () => {
  const mockProps = {
    title: 'Test Stat',
    value: 100,
    change: '+10%',
    changeType: 'positive' as const,
    icon: <div data-testid="test-icon">Icon</div>,
    color: '#1976d2',
  };

  test('renders with correct title and value', () => {
    render(
      <TestWrapper>
        <StatCard {...mockProps} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Stat')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('renders change indicator', () => {
    render(
      <TestWrapper>
        <StatCard {...mockProps} />
      </TestWrapper>
    );
    
    expect(screen.getByText('↗ +10%')).toBeInTheDocument();
  });

  test('renders icon', () => {
    render(
      <TestWrapper>
        <StatCard {...mockProps} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  test('renders with suffix when provided', () => {
    render(
      <TestWrapper>
        <StatCard {...mockProps} suffix="/100" />
      </TestWrapper>
    );
    
    expect(screen.getByText('100/100')).toBeInTheDocument();
  });
});
