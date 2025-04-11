import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchCategories, Categories } from '../../data/categories';

const CategoryPage: React.FC = () => {
  const history = useHistory();
  const [categories, setCategories] = useState<Categories[]>([]);

  // Fetch categories when the component mounts
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      //console.log(fetchedCategories)
      setCategories(fetchedCategories);
    };

    loadCategories();
  }, []); // Empty dependency array ensures it runs only once on mount

  //categories.map((category, index) => (console.log(category)))

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
            {categories.map((category, index) => (
              
              <IonCol size="6" key={category.productCategoryId || index}> {/* Use categoriesId or index as a fallback */}
                <IonCard onClick={() => history.push(`/products/${category.productCategoryId}`)}>
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
