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
  IonListHeader,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import { Order } from '../data/orderTypes';

const OrdersPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'enPreparacion' | 'listo' | 'todos'>('enPreparacion');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [orderProductDetails, setOrderProductDetails] = useState<{ [orderId: number]: any }>({});
  const [loadingProductDetails, setLoadingProductDetails] = useState<{ [orderId: number]: boolean }>({});
  const [errorProductDetails, setErrorProductDetails] = useState<{ [orderId: number]: string | null }>({});

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

  const getStatusChangedAt = (order: Order, statusName: string): number => {
    const status = order.orderStatuses.find(s => s.orderStatusName.toLowerCase() === statusName.toLowerCase());
    if (!status) return 0;
    const dateStr = status.orderTracking[0]?.statusChangedAt || '';
    return dateStr ? new Date(dateStr).getTime() : 0;
  };

  const updateOrderStatus = async (orderId: number) => {
    try {
      const order = orders.find(o => o.orderId === orderId);
      if (!order) {
        setError('Order not found');
        return;
      }
      const latestStatus = order.orderStatuses[0];
      const currentStatusName = latestStatus?.orderStatusName.toLowerCase() || 'pending';

      const statusProgression: { [key: string]: number } = {
        pending: 2,
        preparing: 3,
        done: 3,
        cancel: 4,
      };

      const nextStatusId = statusProgression[currentStatusName] || 1;

      const response = await fetch('https://smartloansbackend.azurewebsites.net/tracking_status_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordersTraking: [
            {
              orderId,
              userId: 1,
              statusTrakingId: nextStatusId,
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

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
    if (!expandedOrderIds.includes(orderId)) {
      fetchOrderProductDetails(orderId);
    }
  };

  const fetchOrderProductDetails = async (orderId: number) => {
    setLoadingProductDetails(prev => ({ ...prev, [orderId]: true }));
    setErrorProductDetails(prev => ({ ...prev, [orderId]: null }));
    try {
      const response = await fetch('https://smartloansbackend.azurewebsites.net/one_products_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: [{ orderId }] }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }
      const data = await response.json();
      setOrderProductDetails(prev => ({ ...prev, [orderId]: data.orderedProducts[0] || null }));
    } catch (error) {
      setErrorProductDetails(prev => ({ ...prev, [orderId]: 'Failed to fetch product details' }));
    } finally {
      setLoadingProductDetails(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const renderOrderItem = (order: Order) => {
    const latestStatus = order.orderStatuses[0];
    const statusName = latestStatus?.orderStatusName || 'Unknown';
    const statusColor = latestStatus?.orderStatusColor || 'black';
    const statusChangedAt = latestStatus?.orderTracking[0]?.statusChangedAt || '';

    const isInPreparation = statusName.toLowerCase() === 'preparing';
    const isExpanded = expandedOrderIds.includes(order.orderId);
    const productDetails = orderProductDetails[order.orderId];
    const loadingDetails = loadingProductDetails[order.orderId];
    const errorDetails = errorProductDetails[order.orderId];

    return (
      <React.Fragment key={order.orderId}>
        <IonItem>
          <IonLabel>
            <h2>Orden #{order.orderId} - Table {order.tableNumber}</h2>
            <p>Total: ${order.total.toFixed(2)}</p>
            <p>Status: <IonText style={{ color: statusColor, fontWeight: 'bold', borderRadius: '8px' }}>{statusName}</IonText></p>
            <p>Ultima Actualizacion: {new Date(statusChangedAt).toLocaleTimeString()}</p>
            {order.comments && <p>Comments: {order.comments}</p>}
            <p
              style={{ cursor: 'pointer', color: 'blue', marginLeft: '10px', textDecoration: 'underline' }}
              onClick={() => toggleOrderDetails(order.orderId)}
            >
              {isExpanded ? 'Hide Product Details' : 'Show Product Details'}
            </p>
          </IonLabel>
          {selectedTab === 'enPreparacion' && (
            <IonToggle
              checked={isInPreparation}
              onIonChange={() => updateOrderStatus(order.orderId)}
              slot="end"
              aria-label="Update order status"
            />
          )}
        </IonItem>
        {isExpanded && (
          <IonList>
            {loadingDetails && <IonItem><IonLabel>Loading product details...</IonLabel></IonItem>}
            {errorDetails && <IonItem><IonLabel color="danger">{errorDetails}</IonLabel></IonItem>}
            {productDetails && (
              <>
                {productDetails.products?.map((product: any, index: number) => (
                  <IonCard key={index}>
                    <IonCardHeader>
                      <IonCardTitle>{product.productName}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {product.po?.map((option: any) => (
                        <div key={option.productOptionId} style={{ marginLeft: '10px' }}>
                          <strong>{option.optionName}:</strong>
                          <ul>
                            {option.poc?.map((choice: any) => (
                              <li key={choice.productOptionChoiceId}>
                                {choice.choiceName} {choice.choicePrice > 0 ? `($${choice.choicePrice.toFixed(2)})` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </IonCardContent>
                  </IonCard>
                ))}
              </>
            )}
          </IonList>
        )}
      </React.Fragment>
    );
  };

  let content;

  if (loading) {
    content = <IonSpinner name="crescent" />;
  } else if (error) {
    content = <IonText color="danger">{error}</IonText>;
  } else {
    if (selectedTab === 'enPreparacion') {
      const preparingOrders = filterOrdersByStatus(['preparing']).sort(
        (a, b) => getStatusChangedAt(b, 'preparing') - getStatusChangedAt(a, 'preparing')
      );
      const pendingOrders = filterOrdersByStatus(['pending']).sort(
        (a, b) => getStatusChangedAt(b, 'pending') - getStatusChangedAt(a, 'pending')
      );

      content = (
        <>
          <IonList>
            <IonListHeader>En preparacion</IonListHeader>
            {preparingOrders.length > 0 ? preparingOrders.map(renderOrderItem) : (
              <IonItem>
                <IonLabel>No orders preparing.</IonLabel>
              </IonItem>
            )}
          </IonList>
          <IonList>
            <IonListHeader>Pendientes</IonListHeader>
            {pendingOrders.length > 0 ? pendingOrders.map(renderOrderItem) : (
              <IonItem>
                <IonLabel>No orders pending.</IonLabel>
              </IonItem>
            )}
          </IonList>
        </>
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
