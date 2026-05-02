import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation } from 'react-query';
import {
  Box,
  Button,
  Paper,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const propertyTypeOptions = [
  { value: 'land', label: 'Land' },
  { value: 'student_housing', label: 'Student Housing' },
  { value: 'residential', label: 'Residential' },
];

const listingTypeOptions = [
  { value: 'sale', label: 'Sale' },
  { value: 'rent', label: 'Rent' },
];

const priceUnitOptions = [
  { value: 'RWF', label: 'RWF' },
  { value: 'RWF/mo', label: 'RWF/mo' },
];

const defaultValues = {
  title: '',
  description: '',
  propertyType: 'land',
  listingType: 'sale',
  price: '',
  priceUnit: 'RWF',
  sector: '',
  district: 'Huye',
  lat: '',
  lng: '',
  sqm: '',
  hectares: '',
  features: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  isVerified: false,
  isFeatured: false,
};

const PropertyForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { api } = useAuth();
  const [serverError, setServerError] = useState('');

  const { control, handleSubmit, reset } = useForm({
    defaultValues,
  });

  const { isLoading: isPropertyLoading } = useQuery(
    ['property', id],
    async () => {
      const response = await api.get(`/properties/${id}`);
      return response.data.data.property;
    },
    {
      enabled: isEditMode,
      onSuccess: (property) => {
        reset({
          title: property.title || '',
          description: property.description || '',
          propertyType: property.propertyType || 'land',
          listingType: property.listingType || 'sale',
          price: property.price || '',
          priceUnit: property.priceUnit || 'RWF',
          sector: property.location?.sector || '',
          district: property.location?.district || 'Huye',
          lat: property.location?.coordinates?.lat ?? '',
          lng: property.location?.coordinates?.lng ?? '',
          sqm: property.size?.sqm ?? '',
          hectares: property.size?.hectares ?? '',
          features: (property.features || []).join(', '),
          contactName: property.contact?.name || '',
          contactPhone: property.contact?.phone || '',
          contactEmail: property.contact?.email || '',
          isVerified: property.isVerified || false,
          isFeatured: property.isFeatured || false,
        });
      },
    }
  );

  const createMutation = useMutation(
    async (payload) => {
      await api.post('/properties', payload);
    },
    {
      onSuccess: () => navigate('/properties'),
    }
  );

  const updateMutation = useMutation(
    async (payload) => {
      await api.put(`/properties/${id}`, payload);
    },
    {
      onSuccess: () => navigate('/properties'),
    }
  );

  const onSubmit = async (formValues) => {
    setServerError('');
    const payload = {
      title: formValues.title,
      description: formValues.description,
      propertyType: formValues.propertyType,
      listingType: formValues.listingType,
      price: Number(formValues.price),
      priceUnit: formValues.priceUnit,
      location: {
        sector: formValues.sector,
        district: formValues.district,
        coordinates: {
          lat: formValues.lat !== '' ? Number(formValues.lat) : undefined,
          lng: formValues.lng !== '' ? Number(formValues.lng) : undefined,
        },
      },
      size: {
        sqm: formValues.sqm !== '' ? Number(formValues.sqm) : undefined,
        hectares: formValues.hectares !== '' ? Number(formValues.hectares) : undefined,
      },
      features: formValues.features
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      contact: {
        name: formValues.contactName,
        phone: formValues.contactPhone,
        email: formValues.contactEmail,
      },
      isVerified: formValues.isVerified,
      isFeatured: formValues.isFeatured,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to save property.');
    }
  };

  const isLoading = isPropertyLoading || createMutation.isLoading || updateMutation.isLoading;
  const pageTitle = isEditMode ? 'Edit Property' : 'Add New Property';

  if (isLoading && isEditMode) {
    return <LoadingSpinner message="Loading property details..." />;
  }

  return (
    <Box>
      <Typography variant="h4" mb={2}>
        {pageTitle}
      </Typography>

      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Property title is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Property Title"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="propertyType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Property Type" fullWidth>
                    {propertyTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Property description is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="listingType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Listing Type" fullWidth>
                    {listingTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Price is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Price"
                    type="number"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="priceUnit"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Price Unit" fullWidth>
                    {priceUnitOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="sector"
                control={control}
                rules={{ required: 'Sector is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Sector"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="District" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <Controller
                name="lat"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Latitude" fullWidth type="number" />
                )}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <Controller
                name="lng"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Longitude" fullWidth type="number" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="sqm"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Size (sqm)" fullWidth type="number" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="hectares"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Size (hectares)" fullWidth type="number" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="features"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Features"
                    fullWidth
                    helperText="Separate features with commas"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="contactName"
                control={control}
                rules={{ required: 'Contact name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Contact Name"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="contactPhone"
                control={control}
                rules={{ required: 'Contact phone is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Contact Phone"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="contactEmail"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Contact Email" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="isVerified"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={field.value} {...field} />}
                    label="Verified"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={field.value} {...field} />}
                    label="Featured"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/properties')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={createMutation.isLoading || updateMutation.isLoading}>
                  {isEditMode ? 'Update Property' : 'Create Property'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PropertyForm;
