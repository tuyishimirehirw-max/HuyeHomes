import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Apartment,
  Mail,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';

// Dashboard Stats Card
const StatsCard = ({ title, value, icon, color, subtitle }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 1,
            p: 1,
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { api } = useAuth();

  // Fetch property stats
  const { data: propertyStats, isLoading: propertyStatsLoading } = useQuery(
    'propertyStats',
    async () => {
      const response = await api.get('/properties/stats');
      return response.data.data;
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch inquiry stats
  const { data: inquiryStats, isLoading: inquiryStatsLoading } = useQuery(
    'inquiryStats',
    async () => {
      const response = await api.get('/inquiries/stats');
      return response.data.data;
    },
    {
      refetchInterval: 30000,
    }
  );

  // Fetch recent properties
  const { data: recentProperties, isLoading: recentPropertiesLoading } = useQuery(
    'recentProperties',
    async () => {
      const response = await api.get('/properties?limit=5&sortBy=createdAt&sortOrder=desc');
      return response.data.data.properties;
    }
  );

  // Fetch recent inquiries
  const { data: recentInquiries, isLoading: recentInquiriesLoading } = useQuery(
    'recentInquiries',
    async () => {
      const response = await api.get('/inquiries?limit=5&sortBy=createdAt&sortOrder=desc');
      return response.data.data.inquiries;
    }
  );

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M RWF`;
    }
    return `${(price / 1000).toFixed(0)}K RWF`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (propertyStatsLoading || inquiryStatsLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={3}>
        Welcome back! Here's what's happening with your properties today.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Properties"
            value={propertyStats?.overview?.totalProperties || 0}
            icon={<Apartment />}
            color="#2e7d32"
            subtitle="Active listings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="New Inquiries"
            value={inquiryStats?.byStatus?.find(s => s._id === 'new')?.count || 0}
            icon={<Mail />}
            color="#ff9800"
            subtitle="Need response"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Views"
            value={propertyStats?.overview?.totalViews || 0}
            icon={<Visibility />}
            color="#2196f3"
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Price"
            value={formatPrice(propertyStats?.overview?.avgPrice || 0)}
            icon={<TrendingUp />}
            color="#9c27b0"
            subtitle="Per property"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Properties */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Properties
            </Typography>
            {recentPropertiesLoading ? (
              <LinearProgress />
            ) : (
              <List>
                {recentProperties?.map((property) => (
                  <ListItem key={property._id} divider>
                    <ListItemText
                      primary={property.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {property.location.sector} • {property.propertyType}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            {formatPrice(property.price)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(property.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={property.status}
                      size="small"
                      color={
                        property.status === 'active'
                          ? 'success'
                          : property.status === 'sold'
                          ? 'default'
                          : 'warning'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Inquiries */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Inquiries
            </Typography>
            {recentInquiriesLoading ? (
              <LinearProgress />
            ) : (
              <List>
                {recentInquiries?.map((inquiry) => (
                  <ListItem key={inquiry._id} divider>
                    <ListItemText
                      primary={inquiry.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {inquiry.email}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" noWrap>
                            {inquiry.message}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(inquiry.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={inquiry.status}
                      size="small"
                      color={
                        inquiry.status === 'new'
                          ? 'warning'
                          : inquiry.status === 'contacted'
                          ? 'info'
                          : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Property Type Distribution */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Properties by Type
            </Typography>
            {propertyStats?.byType?.map((type) => (
              <Box key={type._id} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" textTransform="capitalize">
                    {type._id.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2">
                    {type.count} properties
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(type.count / (propertyStats?.overview?.totalProperties || 1)) * 100}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Top Sectors */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Top Sectors
            </Typography>
            {propertyStats?.bySector?.map((sector) => (
              <Box key={sector._id} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    {sector._id}
                  </Typography>
                  <Typography variant="body2">
                    {sector.count} properties
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(sector.count / (propertyStats?.overview?.totalProperties || 1)) * 100}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
