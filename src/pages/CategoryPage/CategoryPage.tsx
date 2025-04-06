import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { categories } from '../../data/categories';

const CategoryPage: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            {categories.map(category => (
              <IonCol size="6" key={category.id}>
                <IonCard onClick={() => history.push(`/products/${category.id}`)}>
                <img src={category.image} alt={category.name} className="category-image" />
                  <IonCardContent className="ion-text-center">
                    <h2>{category.name}</h2>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default CategoryPage;
