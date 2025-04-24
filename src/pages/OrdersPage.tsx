import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonText,
  IonSpinner,
  IonToggle,
} from '@ionic/react';
import { Order } from '../data/orderTypes';

const OrdersPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'enPreparacion' | 'listo' | 'todos'>('enPreparacion');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://smartloansbackend.azurewebsites.net/list_orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filterOrdersByStatus = (statusNames: string[]) => {
    return orders.filter(order => {
      const latestStatus = order.orderStatuses[0];
      return latestStatus && statusNames.includes(latestStatus.orderStatusName.toLowerCase());
    });
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const statusTrackingMap: { [key: string]: number } = {
      pending: 1,
      done: 2,
    };
    const statusTrakingId = statusTrackingMap[newStatus] || 1;
    try {
      
      const response = await fetch('https://smartloansbackend.azurewebsites.net/update_order_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordersTraking: [
            {
              orderId,
              userId: 1,
              statusTrakingId,
            },
          ],
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      fetchOrders();

    } catch (error) {
      setError('Failed to update order status');
    }
  };


  const renderOrderItem = (order: Order) => {
    const latestStatus = order.orderStatuses[0];
    const statusName = latestStatus?.orderStatusName || 'Unknown';
    const statusColor = latestStatus?.orderStatusColor || 'black';
    const statusChangedAt = latestStatus?.orderTracking[0]?.statusChangedAt || '';

    const isInPreparation = statusColor.toLowerCase() === 'red';

    return (
      <IonItem key={order.orderId}>
        <IonLabel>
          <h2>Order #{order.orderNumber} - Table {order.tableNumber}</h2>
          <p>Total: ${order.total.toFixed(2)}</p>
          <p>Payment: {order.paymentMethod}</p>
          <p>Status: <IonText style={{ color: statusColor }}>{statusName}</IonText></p>
          <p>Last Updated: {new Date(statusChangedAt).toLocaleString()}</p>
          {order.comments && <p>Comments: {order.comments}</p>}
        </IonLabel>
        {selectedTab === 'enPreparacion' && (
          <IonToggle
            checked={false}
            onIonChange={() => updateOrderStatus(order.orderId, 'done')}
            slot="end"
            aria-label="Mark as done"
          />
        )}
      </IonItem>
    );
  };

  let content;

  if (loading) {
    content = <IonSpinner name="crescent" />;
  } else if (error) {
    content = <IonText color="danger">{error}</IonText>;
  } else {
    if (selectedTab === 'enPreparacion') {
      const filtered = filterOrdersByStatus(['pending', 'preparing']);
      content = filtered.length > 0 ? (
        <IonList>{filtered.map(renderOrderItem)}</IonList>
      ) : (
        <IonList>
          <IonItem>
            <IonLabel>No orders en preparacion.</IonLabel>
          </IonItem>
        </IonList>
      );
    } else if (selectedTab === 'listo') {
      const filtered = filterOrdersByStatus(['done']);
      content = filtered.length > 0 ? (
        <IonList>{filtered.map(renderOrderItem)}</IonList>
      ) : (
        <IonList>
          <IonItem>
            <IonLabel>No orders listos.</IonLabel>
          </IonItem>
        </IonList>
      );
    } else {
      content = orders.length > 0 ? (
        <IonList>{orders.map(renderOrderItem)}</IonList>
      ) : (
        <IonList>
          <IonItem>
            <IonLabel>No orders.</IonLabel>
          </IonItem>
        </IonList>
      );
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Orders</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as any)}>
            <IonSegmentButton value="enPreparacion">
              <IonLabel>Preparacion</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="listo">
              <IonLabel>Listos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="todos">
              <IonLabel>Todos</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>{content}</IonContent>
    </IonPage>
  );
};

export default OrdersPage;
