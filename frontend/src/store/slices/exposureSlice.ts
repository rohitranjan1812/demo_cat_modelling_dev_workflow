/**
 * Exposure Redux Slice
 * 
 * State management for Exposure data with:
 * - Full CRUD operations via async thunks
 * - Loading states and error handling
 * - Pagination and filtering support
 * - Optimistic updates
 * - Normalized data structure
 * - Comprehensive selectors
 */

import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { exposureApi } from '../../services/api/exposureApi';
import type { RootState } from '../index';
import type {
  Exposure,
  CreateExposureInput,
  UpdateExposureInput,
  ExposureQueryParams,
  ExposureSearchParams,
  ExposureStatistics,
  ApiResponse,
  PaginatedResponse,
} from '../../types/models';

// ============================================================================
// STATE TYPES
// ============================================================================

export interface ExposureState {
  // Data
  exposures: Record<string, Exposure>; // Normalized by exposureId for efficient lookups
  exposureIds: string[]; // Ordered list of IDs for current view
  selectedExposureId: string | null;
  
  // UI State
  loading: boolean;
  operationLoading: Record<string, boolean>; // Track specific operations
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  // Filters
  filters: ExposureQueryParams;
  searchTerm: string;
  
  // Statistics
  statistics: ExposureStatistics | null;
  statisticsLoading: boolean;
  
  // Cache
  lastFetched: number | null;
  cacheTimeout: number; // milliseconds
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ExposureState = {
  exposures: {},
  exposureIds: [],
  selectedExposureId: null,
  loading: false,
  operationLoading: {},
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {},
  searchTerm: '',
  statistics: null,
  statisticsLoading: false,
  lastFetched: null,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch exposures with pagination and filters
 */
export const fetchExposures = createAsyncThunk<
  PaginatedResponse<Exposure>,
  ExposureQueryParams | undefined,
  { rejectValue: string }
>(
  'exposure/fetchExposures',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await exposureApi.getExposures(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch exposures');
    }
  }
);

/**
 * Fetch a single exposure by ID
 */
export const fetchExposureById = createAsyncThunk<
  Exposure,
  string,
  { rejectValue: string }
>(
  'exposure/fetchExposureById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await exposureApi.getExposureById(id);
      if (!response.data) {
        throw new Error('Exposure not found');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch exposure');
    }
  }
);

/**
 * Create a new exposure
 */
export const createExposure = createAsyncThunk<
  Exposure,
  CreateExposureInput,
  { rejectValue: string }
>(
  'exposure/createExposure',
  async (data, { rejectWithValue }) => {
    try {
      const response = await exposureApi.createExposure(data);
      if (!response.data) {
        throw new Error('Failed to create exposure');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create exposure');
    }
  }
);

/**
 * Update an existing exposure
 */
export const updateExposure = createAsyncThunk<
  Exposure,
  { id: string; data: UpdateExposureInput },
  { rejectValue: string }
>(
  'exposure/updateExposure',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await exposureApi.updateExposure(id, data);
      if (!response.data) {
        throw new Error('Failed to update exposure');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update exposure');
    }
  }
);

/**
 * Delete an exposure
 */
export const deleteExposure = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'exposure/deleteExposure',
  async (id, { rejectWithValue }) => {
    try {
      await exposureApi.deleteExposure(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete exposure');
    }
  }
);

/**
 * Fetch exposures by account ID
 */
export const fetchExposuresByAccount = createAsyncThunk<
  Exposure[],
  string,
  { rejectValue: string }
>(
  'exposure/fetchExposuresByAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await exposureApi.getExposuresByAccount(accountId);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch exposures by account');
    }
  }
);

/**
 * Fetch exposures by location ID
 */
export const fetchExposuresByLocation = createAsyncThunk<
  Exposure[],
  string,
  { rejectValue: string }
>(
  'exposure/fetchExposuresByLocation',
  async (locationId, { rejectWithValue }) => {
    try {
      const response = await exposureApi.getExposuresByLocation(locationId);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch exposures by location');
    }
  }
);

/**
 * Fetch exposures by policy ID
 */
export const fetchExposuresByPolicy = createAsyncThunk<
  Exposure[],
  string,
  { rejectValue: string }
>(
  'exposure/fetchExposuresByPolicy',
  async (policyId, { rejectWithValue }) => {
    try {
      const response = await exposureApi.getExposuresByPolicy(policyId);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch exposures by policy');
    }
  }
);

/**
 * Search exposures with advanced filters
 */
export const searchExposures = createAsyncThunk<
  PaginatedResponse<Exposure>,
  ExposureSearchParams,
  { rejectValue: string }
>(
  'exposure/searchExposures',
  async (params, { rejectWithValue }) => {
    try {
      const response = await exposureApi.searchExposures(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search exposures');
    }
  }
);

/**
 * Fetch exposure statistics
 */
export const fetchExposureStatistics = createAsyncThunk<
  ExposureStatistics,
  string | undefined,
  { rejectValue: string }
>(
  'exposure/fetchExposureStatistics',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await exposureApi.getExposureStatistics(accountId);
      if (!response.data) {
        throw new Error('Failed to fetch statistics');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch statistics');
    }
  }
);

/**
 * Create multiple exposures in bulk
 */
export const createBulkExposures = createAsyncThunk<
  Exposure[],
  CreateExposureInput[],
  { rejectValue: string }
>(
  'exposure/createBulkExposures',
  async (exposures, { rejectWithValue }) => {
    try {
      const response = await exposureApi.createBulkExposures(exposures);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create bulk exposures');
    }
  }
);

/**
 * Batch update exposures
 */
export const batchUpdateExposures = createAsyncThunk<
  Exposure[],
  Array<{ id: string; data: UpdateExposureInput }>,
  { rejectValue: string }
>(
  'exposure/batchUpdateExposures',
  async (updates, { rejectWithValue }) => {
    try {
      const responses = await exposureApi.batchUpdateExposures(updates);
      return responses.map(r => r.data).filter(Boolean) as Exposure[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to batch update exposures');
    }
  }
);

/**
 * Batch delete exposures
 */
export const batchDeleteExposures = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>(
  'exposure/batchDeleteExposures',
  async (ids, { rejectWithValue }) => {
    try {
      await exposureApi.batchDeleteExposures(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to batch delete exposures');
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const exposureSlice = createSlice({
  name: 'exposure',
  initialState,
  reducers: {
    // Synchronous actions
    setFilters: (state, action: PayloadAction<ExposureQueryParams>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
    
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.pagination.page = 1;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when limit changes
    },
    
    selectExposure: (state, action: PayloadAction<string>) => {
      state.selectedExposureId = action.payload;
    },
    
    clearSelectedExposure: (state) => {
      state.selectedExposureId = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearExposures: (state) => {
      state.exposures = {};
      state.exposureIds = [];
      state.selectedExposureId = null;
      state.error = null;
      state.lastFetched = null;
    },
    
    // Optimistic update for better UX
    optimisticUpdate: (state, action: PayloadAction<{ id: string; data: Partial<Exposure> }>) => {
      const { id, data } = action.payload;
      if (state.exposures[id]) {
        state.exposures[id] = { ...state.exposures[id], ...data };
      }
    },
    
    // Optimistic delete
    optimisticDelete: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.exposures[id];
      state.exposureIds = state.exposureIds.filter(exposureId => exposureId !== id);
      if (state.selectedExposureId === id) {
        state.selectedExposureId = null;
      }
    },
  },
  
  extraReducers: (builder) => {
    // ========================================================================
    // FETCH EXPOSURES
    // ========================================================================
    builder
      .addCase(fetchExposures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExposures.fulfilled, (state, action) => {
        state.loading = false;
        
        // Normalize exposures by ID
        const exposures: Record<string, Exposure> = {};
        const exposureIds: string[] = [];
        
        action.payload.data.forEach((exposure) => {
          exposures[exposure.exposureId] = exposure;
          exposureIds.push(exposure.exposureId);
        });
        
        state.exposures = exposures;
        state.exposureIds = exposureIds;
        state.pagination = action.payload.pagination;
        state.lastFetched = Date.now();
      })
      .addCase(fetchExposures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch exposures';
      });
    
    // ========================================================================
    // FETCH EXPOSURE BY ID
    // ========================================================================
    builder
      .addCase(fetchExposureById.pending, (state, action) => {
        state.operationLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(fetchExposureById.fulfilled, (state, action) => {
        const exposure = action.payload;
        state.operationLoading[action.meta.arg] = false;
        
        // Add to normalized state
        state.exposures[exposure.exposureId] = exposure;
        
        // Add to list if not already present
        if (!state.exposureIds.includes(exposure.exposureId)) {
          state.exposureIds.push(exposure.exposureId);
        }
      })
      .addCase(fetchExposureById.rejected, (state, action) => {
        state.operationLoading[action.meta.arg] = false;
        state.error = action.payload || 'Failed to fetch exposure';
      });
    
    // ========================================================================
    // CREATE EXPOSURE
    // ========================================================================
    builder
      .addCase(createExposure.pending, (state) => {
        state.operationLoading.create = true;
        state.error = null;
      })
      .addCase(createExposure.fulfilled, (state, action) => {
        const exposure = action.payload;
        state.operationLoading.create = false;
        
        // Add to normalized state
        state.exposures[exposure.exposureId] = exposure;
        state.exposureIds.unshift(exposure.exposureId); // Add to beginning
        state.pagination.total += 1;
        
        // Select newly created exposure
        state.selectedExposureId = exposure.exposureId;
      })
      .addCase(createExposure.rejected, (state, action) => {
        state.operationLoading.create = false;
        state.error = action.payload || 'Failed to create exposure';
      });
    
    // ========================================================================
    // UPDATE EXPOSURE
    // ========================================================================
    builder
      .addCase(updateExposure.pending, (state, action) => {
        state.operationLoading[action.meta.arg.id] = true;
        state.error = null;
      })
      .addCase(updateExposure.fulfilled, (state, action) => {
        const exposure = action.payload;
        state.operationLoading[action.meta.arg.id] = false;
        
        // Update in normalized state
        state.exposures[exposure.exposureId] = exposure;
      })
      .addCase(updateExposure.rejected, (state, action) => {
        state.operationLoading[action.meta.arg.id] = false;
        state.error = action.payload || 'Failed to update exposure';
      });
    
    // ========================================================================
    // DELETE EXPOSURE
    // ========================================================================
    builder
      .addCase(deleteExposure.pending, (state, action) => {
        state.operationLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(deleteExposure.fulfilled, (state, action) => {
        const id = action.payload;
        state.operationLoading[id] = false;
        
        // Remove from normalized state
        delete state.exposures[id];
        state.exposureIds = state.exposureIds.filter(exposureId => exposureId !== id);
        state.pagination.total -= 1;
        
        // Clear selection if deleted
        if (state.selectedExposureId === id) {
          state.selectedExposureId = null;
        }
      })
      .addCase(deleteExposure.rejected, (state, action) => {
        state.operationLoading[action.meta.arg] = false;
        state.error = action.payload || 'Failed to delete exposure';
      });
    
    // ========================================================================
    // FETCH BY ACCOUNT/LOCATION/POLICY
    // ========================================================================
    builder
      .addCase(fetchExposuresByAccount.fulfilled, (state, action) => {
        const exposures: Record<string, Exposure> = {};
        const exposureIds: string[] = [];
        
        action.payload.forEach((exposure) => {
          exposures[exposure.exposureId] = exposure;
          exposureIds.push(exposure.exposureId);
        });
        
        state.exposures = exposures;
        state.exposureIds = exposureIds;
        state.loading = false;
      })
      .addCase(fetchExposuresByLocation.fulfilled, (state, action) => {
        const exposures: Record<string, Exposure> = {};
        const exposureIds: string[] = [];
        
        action.payload.forEach((exposure) => {
          exposures[exposure.exposureId] = exposure;
          exposureIds.push(exposure.exposureId);
        });
        
        state.exposures = exposures;
        state.exposureIds = exposureIds;
        state.loading = false;
      })
      .addCase(fetchExposuresByPolicy.fulfilled, (state, action) => {
        const exposures: Record<string, Exposure> = {};
        const exposureIds: string[] = [];
        
        action.payload.forEach((exposure) => {
          exposures[exposure.exposureId] = exposure;
          exposureIds.push(exposure.exposureId);
        });
        
        state.exposures = exposures;
        state.exposureIds = exposureIds;
        state.loading = false;
      });
    
    // ========================================================================
    // SEARCH EXPOSURES
    // ========================================================================
    builder
      .addCase(searchExposures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchExposures.fulfilled, (state, action) => {
        state.loading = false;
        
        const exposures: Record<string, Exposure> = {};
        const exposureIds: string[] = [];
        
        action.payload.data.forEach((exposure) => {
          exposures[exposure.exposureId] = exposure;
          exposureIds.push(exposure.exposureId);
        });
        
        state.exposures = exposures;
        state.exposureIds = exposureIds;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchExposures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search exposures';
      });
    
    // ========================================================================
    // STATISTICS
    // ========================================================================
    builder
      .addCase(fetchExposureStatistics.pending, (state) => {
        state.statisticsLoading = true;
      })
      .addCase(fetchExposureStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchExposureStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.error = action.payload || 'Failed to fetch statistics';
      });
    
    // ========================================================================
    // BULK OPERATIONS
    // ========================================================================
    builder
      .addCase(createBulkExposures.fulfilled, (state, action) => {
        action.payload.forEach((exposure) => {
          state.exposures[exposure.exposureId] = exposure;
          state.exposureIds.unshift(exposure.exposureId);
        });
        state.pagination.total += action.payload.length;
      })
      .addCase(batchUpdateExposures.fulfilled, (state, action) => {
        action.payload.forEach((exposure) => {
          state.exposures[exposure.exposureId] = exposure;
        });
      })
      .addCase(batchDeleteExposures.fulfilled, (state, action) => {
        action.payload.forEach((id) => {
          delete state.exposures[id];
        });
        state.exposureIds = state.exposureIds.filter(
          id => !action.payload.includes(id)
        );
        state.pagination.total -= action.payload.length;
      });
  },
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  setFilters,
  clearFilters,
  setSearchTerm,
  setPage,
  setLimit,
  selectExposure,
  clearSelectedExposure,
  clearError,
  clearExposures,
  optimisticUpdate,
  optimisticDelete,
} = exposureSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

// Basic selectors
export const selectExposureState = (state: RootState) => state.exposure;
export const selectAllExposures = (state: RootState) => 
  state.exposure.exposureIds.map(id => state.exposure.exposures[id]);
export const selectExposureById = (state: RootState, id: string) => 
  state.exposure.exposures[id];
export const selectSelectedExposure = (state: RootState) => 
  state.exposure.selectedExposureId 
    ? state.exposure.exposures[state.exposure.selectedExposureId]
    : null;
export const selectLoading = (state: RootState) => state.exposure.loading;
export const selectError = (state: RootState) => state.exposure.error;
export const selectPagination = (state: RootState) => state.exposure.pagination;
export const selectFilters = (state: RootState) => state.exposure.filters;
export const selectSearchTerm = (state: RootState) => state.exposure.searchTerm;
export const selectStatistics = (state: RootState) => state.exposure.statistics;
export const selectStatisticsLoading = (state: RootState) => state.exposure.statisticsLoading;

// Memoized selectors
export const selectExposuresArray = createSelector(
  [selectAllExposures],
  (exposures) => exposures
);

export const selectExposuresByType = createSelector(
  [selectAllExposures, (_state: RootState, type: string) => type],
  (exposures, type) => exposures.filter(exp => exp.exposureType === type)
);

export const selectExposuresByAccount = createSelector(
  [selectAllExposures, (_state: RootState, accountId: string) => accountId],
  (exposures, accountId) => exposures.filter(exp => exp.accountId === accountId)
);

export const selectExposuresByStatus = createSelector(
  [selectAllExposures, (_state: RootState, status: string) => status],
  (exposures, status) => exposures.filter(exp => exp.status === status)
);

export const selectTotalExposureValue = createSelector(
  [selectAllExposures],
  (exposures) => exposures.reduce((sum, exp) => sum + exp.totalInsuredValue, 0)
);

export const selectExposureCount = createSelector(
  [selectAllExposures],
  (exposures) => exposures.length
);

export const selectHasExposures = createSelector(
  [selectExposureCount],
  (count) => count > 0
);

export const selectIsOperationLoading = (state: RootState, operation: string) =>
  state.exposure.operationLoading[operation] || false;

export const selectNeedsFetch = createSelector(
  [selectExposureState],
  (state) => {
    if (!state.lastFetched) return true;
    const now = Date.now();
    return (now - state.lastFetched) > state.cacheTimeout;
  }
);

// ============================================================================
// REDUCER
// ============================================================================

export default exposureSlice.reducer;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// In a React component:

import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExposures,
  selectAllExposures,
  selectLoading,
  selectPagination,
  setFilters,
  setPage,
} from './store/slices/exposureSlice';

function ExposureList() {
  const dispatch = useDispatch();
  const exposures = useSelector(selectAllExposures);
  const loading = useSelector(selectLoading);
  const pagination = useSelector(selectPagination);
  
  useEffect(() => {
    dispatch(fetchExposures({ page: 1, limit: 20 }));
  }, [dispatch]);
  
  const handleFilterChange = (filters) => {
    dispatch(setFilters(filters));
    dispatch(fetchExposures({ ...filters, page: 1 }));
  };
  
  const handlePageChange = (page) => {
    dispatch(setPage(page));
    dispatch(fetchExposures({ page }));
  };
  
  if (loading) return <Loading />;
  
  return (
    <div>
      {exposures.map(exposure => (
        <ExposureCard key={exposure.exposureId} exposure={exposure} />
      ))}
      <Pagination {...pagination} onPageChange={handlePageChange} />
    </div>
  );
}
*/
