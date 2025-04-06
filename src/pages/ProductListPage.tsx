import {
    IonPage,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButton,
    IonButtons,
    IonBackButton,
  } from '@ionic/react';
  import { useParams, useHistory } from 'react-router-dom';
  import { products } from '../data/products';
  
  interface RouteParams {
    categoryId: string;
  }
  
  const ProductListPage: React.FC = () => {
    const { categoryId } = useParams<RouteParams>();
    const history = useHistory();
  
    const filteredProducts = products.filter(p => p.categoryId === categoryId);
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              {/* 👇 Back button appears in the top-left corner */}
              <IonBackButton defaultHref="/" />
            </IonButtons>
            <IonTitle>Productos</IonTitle>
          </IonToolbar>
        </IonHeader>
  
        <IonContent>
          {filteredProducts.map(product => (
            <IonCard key={product.id}>
              <img src={product.image} alt={product.name} />
              <IonCardHeader>
                <IonCardTitle>{product.name}</IonCardTitle>
                <IonCardSubtitle>${product.price}</IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>
                <p>{product.description}</p>
                <IonButton
                  expand="block"
                  onClick={() => history.push(`/product/${product.id}`)}
                >
                  Ver detalles
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))}
        </IonContent>
      </IonPage>
    );
  };
  
  export default ProductListPage;
  