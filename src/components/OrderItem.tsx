import React from 'react';
import { IonItem, IonLabel, IonText, IonToggle } from '@ionic/react';
import { Order } from '../data/orderTypes';

interface OrderItemProps {
  order: Order;
  selectedTab: 'enPreparacion' | 'listo' | 'todos';
  onUpdateStatus: (orderId: number, newStatus: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, selectedTab, onUpdateStatus }) => {
  const latestStatus = order.orderStatuses[0];
  const statusName = latestStatus?.orderStatusName || 'Unknown';
  const statusColor = latestStatus?.orderStatusColor || 'black';
  const statusChangedAt = latestStatus?.orderTracking[0]?.statusChangedAt || '';

  const isInPreparation = statusColor.toLowerCase() === 'red';
  const isDone = statusColor.toLowerCase() === 'green';

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
          onIonChange={() => onUpdateStatus(order.orderId, 'done')}
          slot="end"
          aria-label="Mark as done"
        />
      )}
      {selectedTab === 'todos' && !isInPreparation && !isDone && (
        <IonToggle
          checked={false}
          onIonChange={() => onUpdateStatus(order.orderId, 'pending')}
          slot="end"
          aria-label="Start preparation"
        />
      )}
    </IonItem>
  );
};

export default OrderItem;
