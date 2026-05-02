import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();

  const { data, isLoading, isError, error } = useQuery(
    ['property', id],
    async () => {
      const response = await api.get(`/properties/${id}`);
      return response.data.data.property;
    }
  );

  const deleteMutation = useMutation(async () => {
    await api.delete(`/properties/${id}`);
  }, {
    onSuccess: () => {
      navigate('/properties');
    },
  });

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this property permanently?');
    if (confirmed) {
      await deleteMutation.mutateAsync();
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading property details..." />;
  }

  if (isError) {
    return <Alert severity="error">{error.message || 'Unable to load property.'}</Alert>;
  }

  const property = data;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">{property.title}</Typography>
          <Typography color="text.secondary" mt={1}>
            {property.propertyType.replace('_', ' ')} · {property.listingType}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate(`/properties/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteMutation.isLoading}>
            Delete
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography>{property.description}</Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Typography><strong>Price:</strong> {property.priceUnit} {property.price.toLocaleString()}</Typography>
            <Typography><strong>Sector:</strong> {property.location?.sector || '-'}</Typography>
            <Typography><strong>District:</strong> {property.location?.district || '-'}</Typography>
            <Typography><strong>Status:</strong> {property.status || 'active'}</Typography>
            <Typography><strong>Verified:</strong> {property.isVerified ? 'Yes' : 'No'}</Typography>
            <Typography><strong>Featured:</strong> {property.isFeatured ? 'Yes' : 'No'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Contact
            </Typography>
            <Typography><strong>Name:</strong> {property.contact?.name}</Typography>
            <Typography><strong>Phone:</strong> {property.contact?.phone}</Typography>
            <Typography><strong>Email:</strong> {property.contact?.email || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Additional Info
            </Typography>
            <Typography><strong>Size:</strong> {property.size?.sqm ? `${property.size.sqm} sqm` : '-'} {property.size?.hectares ? ` / ${property.size.hectares} ha` : ''}</Typography>
            <Typography><strong>Coordinates:</strong> {property.location?.coordinates?.lat ?? '-'} , {property.location?.coordinates?.lng ?? '-'}</Typography>
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Features
              </Typography>
              {property.features?.length ? (
                property.features.map((feature) => (
                  <Chip key={feature} label={feature} size="small" sx={{ mr: 1, mb: 1 }} />
                ))
              ) : (
                <Typography color="text.secondary">No features listed.</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PropertyDetail;
