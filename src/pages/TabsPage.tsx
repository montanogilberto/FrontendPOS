import React from 'react';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import { home as homeIcon, list as listIcon, settings as settingsIcon } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import CategoryPage from './CategoryPage/CategoryPage';

import OrdersPage from './OrdersPage';
import ManagerPage from './ManagerPage';

const TabsPage: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/tabs/home" component={CategoryPage} exact />
        <Route path="/tabs/orders" component={OrdersPage} exact />
        <Route path="/tabs/manager" component={ManagerPage} exact />
        <Route path="/tabs" render={() => <Redirect to="/tabs/home" />} exact />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/tabs/home">
          <IonIcon icon={homeIcon} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="orders" href="/tabs/orders">
          <IonIcon icon={listIcon} />
          <IonLabel>Orders</IonLabel>
        </IonTabButton>
        <IonTabButton tab="manager" href="/tabs/manager">
          <IonIcon icon={settingsIcon} />
          <IonLabel>Manager</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default TabsPage;
