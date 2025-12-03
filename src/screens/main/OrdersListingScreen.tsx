import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ordersApi, Order } from '../../api/endpoints';
import { logger } from '../../utils/logger';

// Order status color mapping
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  INITIATED: { bg: '#FFF3E0', text: '#E65100' },
  PROCESSING: { bg: '#E3F2FD', text: '#1565C0' },
  SUCCESS: { bg: '#E8F5E9', text: '#2E7D32' },
  REJECTED: { bg: '#FFEBEE', text: '#C62828' },
};

const getStatusColor = (status: string) => {
  return STATUS_COLORS[status] || { bg: '#F5F5F5', text: '#616161' };
};

// Format date to readable format
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format amount with rupee symbol
const formatAmount = (amount?: number): string => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusColor = getStatusColor(order.status);

  return (
    <Card style={styles.orderCard} mode="elevated">
      <Card.Content>
        {/* Header with date and status */}
        <View style={styles.cardHeader}>
          <Text variant="labelMedium" style={styles.orderDate}>
            {formatDate(order.createdAt)}
          </Text>
          <Chip
            mode="flat"
            style={[styles.statusChip, { backgroundColor: statusColor.bg }]}
            textStyle={[styles.statusText, { color: statusColor.text }]}
          >
            {order.status}
          </Chip>
        </View>

        {/* Service/Category */}
        <View style={styles.infoRow}>
          <Text variant="labelSmall" style={styles.label}>Service</Text>
          <Text variant="bodyMedium" style={styles.value}>
            {order.category?.name || 'N/A'}
          </Text>
        </View>

        {/* Plan Title (if available) */}
        {order.plan?.title && (
          <View style={styles.infoRow}>
            <Text variant="labelSmall" style={styles.label}>Plan</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {order.plan.title}
            </Text>
          </View>
        )}

        {/* Amount */}
        <View style={styles.infoRow}>
          <Text variant="labelSmall" style={styles.label}>Amount Paid</Text>
          <Text variant="titleMedium" style={styles.amount}>
            {formatAmount(order.amount)}
          </Text>
        </View>

        {/* Order ID (small, for reference) */}
        <Text variant="labelSmall" style={styles.orderId}>
          Order ID: {order.id.substring(0, 8)}...
        </Text>
      </Card.Content>
    </Card>
  );
};

export default function OrdersListingScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await ordersApi.getUserOrders();
      
      if (response.data) {
        setOrders(response.data);
        logger.info('Orders', `Fetched ${response.data.length} orders`);
      }
    } catch (err: any) {
      logger.error('Orders: Failed to fetch orders', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Orders Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        You haven't placed any orders yet. Start exploring our services!
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.errorTitle}>
        Oops!
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {error}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          My Orders
        </Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Text>
      </Surface>

      {error ? (
        renderError()
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6200ee']}
              tintColor="#6200ee"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    color: '#666',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  orderCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderDate: {
    color: '#666',
  },
  statusChip: {
    borderRadius: 8,
    height: 28,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  orderId: {
    color: '#aaa',
    marginTop: 12,
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorTitle: {
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});



