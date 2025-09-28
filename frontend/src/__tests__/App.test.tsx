import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from '../App';

const theme = createTheme();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

describe('App', () => {
  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Check if the main layout elements are present
    expect(screen.getByText('CAT Modeling Platform')).toBeInTheDocument();
  });

  test('renders dashboard by default', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Check if dashboard elements are present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
