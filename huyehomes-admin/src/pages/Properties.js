import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Properties = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery(
    ['properties'],
    async () => {
      const response = await api.get('/properties?limit=200');
      return response.data.data.properties;
    },
    {
      staleTime: 1000 * 60,
    }
  );

  const deleteMutation = useMutation(
    async (propertyId) => {
      await api.delete(`/properties/${propertyId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['properties']);
      },
    }
  );

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this property? This action cannot be undone.'
    );

    if (!confirmed) return;

    await deleteMutation.mutateAsync(propertyId);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading properties..." />;
  }

  if (isError) {
    return (
      <Box>
        <Alert severity="error">{error.message || 'Failed to load properties.'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Properties
          </Typography>
          <Typography color="text.secondary">
            Add, edit, or remove your property listings from the admin dashboard.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/properties/new')}
        >
          Add New Property
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Listing</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Sector</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No properties available. Click "Add New Property" to create one.
                </TableCell>
              </TableRow>
            ) : (
              data.map((property) => (
                <TableRow key={property._id} hover>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{property.propertyType.replace('_', ' ')}</TableCell>
                  <TableCell>{property.listingType}</TableCell>
                  <TableCell>{property.priceUnit} {property.price.toLocaleString()}</TableCell>
                  <TableCell>{property.location?.sector || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.status || 'active'}
                      color={property.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.isFeatured ? 'Yes' : 'No'}
                      color={property.isFeatured ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/properties/${property._id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/properties/${property._id}/edit`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(property._id)}
                        disabled={deleteMutation.isLoading}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Properties;
