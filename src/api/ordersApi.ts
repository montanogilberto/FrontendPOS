export async function fetchOrders() {
  const response = await fetch('https://smartloansbackend.azurewebsites.net/list_orders');
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  const data = await response.json();
  return data.orders || [];
}

export async function updateOrderStatus(orderId: number, newStatus: string) {
  const response = await fetch('https://smartloansbackend.azurewebsites.net/update_order_status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, status: newStatus }),
  });
  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
  return true;
}
