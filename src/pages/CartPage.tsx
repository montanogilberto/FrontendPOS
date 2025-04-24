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
  IonAlert,
} from '@ionic/react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { submitOrder } from '../api/cartApi';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const history = useHistory();
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | ''>('');
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!paymentMethod) {
      setShowAlert(true);
      return;
    }

    const orderData = {
      orders: cart.map((item) => {
        const selections = Object.entries(item.selectedOptions || {}).map(([optionType, optionValues]) => {
          return (Array.isArray(optionValues) ? optionValues : [optionValues]).map((value: string) => ({
            productOptionId: optionType,
            productOptionChoiceId: value,
          }));
        }).flat();

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
      }),
    };

    try {
      const response = await submitOrder(orderData);
      if (response.ok) {
        setShowSuccess(true);
      } else {
        const errorData = await response.json();
        console.error('Order error:', errorData.detail);
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
                <CartItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  quantity={item.quantity}
                  price={item.price}
                  selectedOptionLabels={item.selectedOptionLabels}
                  onRemove={removeFromCart}
                />
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
