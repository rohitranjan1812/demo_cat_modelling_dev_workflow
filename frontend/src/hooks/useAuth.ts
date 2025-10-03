// Re-export the useAuth hook from AuthContext for cleaner imports
export { useAuth, AuthProvider } from '../contexts/AuthContext';
export type { User, AuthTokens, LoginResponse } from '../contexts/AuthContext';
