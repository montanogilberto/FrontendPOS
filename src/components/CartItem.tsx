import React from 'react';
import { IonCard, IonCardContent, IonButton } from '@ionic/react';

interface CartItemProps {
  id: string;
  name: string;
  quantity: number;
  price: number;
  selectedOptionLabels?: { [key: string]: string | string[] };
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ id, name, quantity, price, selectedOptionLabels, onRemove }) => {
  return (
    <IonCard>
      <IonCardContent>
        <h2>{name}</h2>
        <p>Cantidad: {quantity}</p>
        <p>Precio unitario: ${price}</p>

        {selectedOptionLabels && (
          <ul style={{ marginTop: 10 }}>
            {Object.entries(selectedOptionLabels).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
              </li>
            ))}
          </ul>
        )}

        <IonButton color="danger" size="small" onClick={() => onRemove(id)}>
          Eliminar
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default CartItem;
