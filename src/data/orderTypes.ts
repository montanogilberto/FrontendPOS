export interface OrderTracking {
  statusChangedAt: string;
}

export interface OrderStatus {
  orderStatusName: string;
  orderStatusColor: string;
  orderTracking: OrderTracking[];
}

export interface Order {
  orderId: number;
  orderNumber: number;
  tableNumber: number;
  userId: number;
  total: number;
  paymentMethod: string;
  orderDate: string;
  comments: string;
  orderStatuses: OrderStatus[];
}
