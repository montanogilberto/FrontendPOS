export const fetchOrders = async () => {
  const response = await fetch('https://smartloansbackend.azurewebsites.net/list_orders');
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  const data = await response.json();
  return data.orders || [];
};

export const fetchOrderProductDetails = async (orderId: number) => {
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
  return data.orderedProducts[0] || null;
};

export const updateOrderStatus = async (orderId: number, nextStatusId: number) => {
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
  return true;
};

export const fetchCommands = async () => {
  const response = await fetch('https://smartloansbackend.azurewebsites.net/all_commands');
  if (!response.ok) {
    throw new Error('Failed to fetch commands');
  }
  const data = await response.json();
  return data.commands || [];
};
