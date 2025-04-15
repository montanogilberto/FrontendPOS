import React, { useState } from 'react';
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
} from '@ionic/react';

const OrdersPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('enPreparacion');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Orders</IonTitle>
        </IonToolbar>
        <IonToolbar>
<IonSegment
  value={selectedTab}
  onIonChange={e => setSelectedTab(e.detail.value as string)}
>
            <IonSegmentButton value="enPreparacion">
              <IonLabel>En Preparacion</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="listo">
              <IonLabel>Listo</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="todos">
              <IonLabel>Todos</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {selectedTab === 'enPreparacion' && (
          <IonList>
            <IonItem>
              <IonLabel>No orders en preparacion.</IonLabel>
            </IonItem>
          </IonList>
        )}
        {selectedTab === 'listo' && (
          <IonList>
            <IonItem>
              <IonLabel>No orders listos.</IonLabel>
            </IonItem>
          </IonList>
        )}
        {selectedTab === 'todos' && (
          <IonList>
            <IonItem>
              <IonLabel>No orders.</IonLabel>
            </IonItem>
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default OrdersPage;
