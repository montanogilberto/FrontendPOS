import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonButton,
  IonText,
  IonButtons,
  IonBackButton,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonAlert,
} from '@ionic/react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const history = useHistory();
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | ''>('');
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  console.log(cart)

  const handleCheckout = async () => {
    if (!paymentMethod) {
      setShowAlert(true);
      return;
    }
  
    // Wrap the order data inside an object with the "orders" key
    const orderData = {
      orders: cart.map((item) => {
        const selections = Object.entries(item.selectedOptions).map(([optionType, optionValues]) => {
          return (Array.isArray(optionValues) ? optionValues : [optionValues]).map((value: string) => ({
            productOptionId: optionType,  // This could be the type of the option (e.g., "ingredientes")
            productOptionChoiceId: value, // This is the value of the option choice (e.g., "aguacate")
          }));
        }).flat();  // Flatten the array if selections have nested arrays
    
        return {
          productId: item.productId,
          quantity: item.quantity,
          paymentMethod: paymentMethod,
          orderNumber: Math.floor(Math.random() * 10000),
          tableNumber: 5,
          userId: 1,
          total: item.price * item.quantity,
          clientId: 1,
          comments: '',
          selections: selections,
        };
      })
    };
  
    console.log(JSON.stringify(orderData, null, 2)); // Log the order data to inspect the structure
    
    try {
      const response = await fetch('https://smartloansbackend.azurewebsites.net/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),  // Send the correctly formatted data
      });
  
      if (response.ok) {
        setShowSuccess(true);
      } else {
        const errorData = await response.json();
        console.error('Order error:', errorData.detail);  // Log detailed error response
        alert('Ocurrió un error al procesar el pedido.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };
  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Carrito</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {cart.length === 0 ? (
          <IonText>El carrito está vacío.</IonText>
        ) : (
          <>
            <IonList>
              {cart.map((item) => (
                <IonCard key={item.id}>
                  <IonCardContent>
                    <h2>{item.name}</h2>
                    <p>Cantidad: {item.quantity}</p>
                    <p>Precio unitario: ${item.price}</p>

                    {item.selectedOptions && (
                      <ul style={{ marginTop: 10 }}>
                        {Object.entries(item.selectedOptions).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong>{' '}
                            {Array.isArray(value) ? value.join(', ') : value}
                          </li>
                        ))}
                      </ul>
                    )}

                    <IonButton
                      color="danger"
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Eliminar
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>

            <IonItem lines="none">
              <IonLabel>
                <h2>Total: ${total.toFixed(2)}</h2>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Método de pago</IonLabel>
              <IonSelect
                value={paymentMethod}
                onIonChange={(e) => setPaymentMethod(e.detail.value)}
                interface="popover"
              >
                <IonSelectOption value="efectivo">Efectivo</IonSelectOption>
                <IonSelectOption value="tarjeta">Tarjeta</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonButton expand="block" color="primary" onClick={handleCheckout}>
              Proceder al pago
            </IonButton>

            <IonButton expand="block" color="medium" onClick={clearCart}>
              Vaciar carrito
            </IonButton>
          </>
        )}
      </IonContent>

      {/* ✅ Success alert */}
      <IonAlert
        isOpen={showSuccess}
        onDidDismiss={() => {
          clearCart();
          setShowSuccess(false);
          history.push('/');
        }}
        header="¡Pedido realizado!"
        message={`El pedido se realizó con éxito. Método de pago: ${paymentMethod}`}
        buttons={['OK']}
      />

      {/* ⚠️ Payment method required alert */}
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Método de pago requerido"
        message="Por favor selecciona una forma de pago antes de continuar."
        buttons={['OK']}
      />
    </IonPage>
  );
};

export default CartPage;
