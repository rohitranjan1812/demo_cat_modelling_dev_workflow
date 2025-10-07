/**
 * ExposureList Component
 * 
 * Professional data grid displaying all exposures with:
 * - Material-UI DataGrid for performance
 * - Redux integration for state management
 * - Pagination, sorting, and filtering
 * - Row selection for bulk operations
 * - Action buttons (View, Edit, Delete)
 * - Loading states and error handling
 * 
 * Architecture:
 * - Connects to Redux exposureSlice for data
 * - Dispatches actions for CRUD operations
 * - Formats currency and enum values for display
 * - Responsive column configuration
 */

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteMultipleIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

// Redux
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectAllExposures,
  selectLoading,
  selectPagination,
  deleteExposure,
  batchDeleteExposures,
  setPage,
  setLimit,
  fetchExposures,
  selectFilters,
} from '../../../store/slices/exposureSlice';

// Types
import type { Exposure } from '../../../types/models';

interface ExposureListProps {
  onViewDetail: (exposureId: string) => void;
  onEdit?: (exposureId: string) => void;
}

const ExposureList: React.FC<ExposureListProps> = ({ onViewDetail, onEdit }) => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const exposures = useAppSelector(selectAllExposures);
  const loading = useAppSelector(selectLoading);
  const pagination = useAppSelector(selectPagination);
  const filters = useAppSelector(selectFilters);

  // Local state
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | string[] | null>(null);

  // Format currency
  const formatCurrency = (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get status color
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Inactive':
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Column definitions
  const columns: GridColDef<Exposure>[] = [
    {
      field: 'exposureId',
      headerName: 'Exposure ID',
      width: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: 'primary.main',
            fontWeight: 500,
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'accountId',
      headerName: 'Account',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'locationId',
      headerName: 'Location',
      width: 150,
      renderCell: (params) => (
        <Tooltip title={`Coordinates: ${params.row.location?.latitude.toFixed(4)}, ${params.row.location?.longitude.toFixed(4)}`}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'exposureType',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'occupancyType',
      headerName: 'Occupancy',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'constructionType',
      headerName: 'Construction',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'totalInsuredValue',
      headerName: 'TIV',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
          {formatCurrency(params.value, params.row.currency)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value)}
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onViewDetail(params.row.exposureId)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="info"
                onClick={() => onEdit(params.row.exposureId)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row.exposureId)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Handlers
  const handleDeleteClick = (exposureId: string) => {
    setDeleteTarget(exposureId);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedRows.length === 0) {
      toast.error('No rows selected');
      return;
    }
    setDeleteTarget(selectedRows as string[]);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (Array.isArray(deleteTarget)) {
        // Bulk delete
        await (dispatch as any)(batchDeleteExposures(deleteTarget)).unwrap();
        toast.success(`${deleteTarget.length} exposures deleted successfully`);
        setSelectedRows([]);
      } else if (deleteTarget) {
        // Single delete
        await (dispatch as any)(deleteExposure(deleteTarget)).unwrap();
        toast.success('Exposure deleted successfully');
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      
      // Refresh data
      (dispatch as any)(fetchExposures({ ...filters, page: pagination.page, limit: pagination.limit }));
    } catch (error: any) {
      toast.error(error || 'Failed to delete exposure(s)');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handlePaginationChange = (model: GridPaginationModel) => {
    dispatch(setPage(model.page + 1)); // DataGrid uses 0-based, we use 1-based
    if (model.pageSize !== pagination.limit) {
      dispatch(setLimit(model.pageSize));
    }
  };

  const handleSortChange = (model: GridSortModel) => {
    // TODO: Implement server-side sorting
    console.log('Sort model changed:', model);
  };

  const handleRowSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedRows(newSelection);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: 'primary.50',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedRows.length} row(s) selected
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteMultipleIcon />}
            onClick={handleBulkDeleteClick}
            sx={{ textTransform: 'none' }}
          >
            Delete Selected
          </Button>
        </Box>
      )}

      {/* DataGrid */}
      <DataGrid
        rows={exposures}
        columns={columns}
        getRowId={(row) => row.exposureId}
        loading={loading}
        pagination
        paginationMode="server"
        paginationModel={{
          page: pagination.page - 1, // DataGrid uses 0-based
          pageSize: pagination.limit,
        }}
        rowCount={pagination.total}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10, 20, 50, 100]}
        sortingMode="server"
        onSortModelChange={handleSortChange}
        checkboxSelection
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={handleRowSelectionChange}
        disableRowSelectionOnClick
        sx={{
          height: 600,
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#fafafa',
            fontWeight: 600,
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {Array.isArray(deleteTarget) ? 'Delete Multiple Exposures' : 'Delete Exposure'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {Array.isArray(deleteTarget)
              ? `Are you sure you want to delete ${deleteTarget.length} exposures? This action cannot be undone.`
              : 'Are you sure you want to delete this exposure? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExposureList;
