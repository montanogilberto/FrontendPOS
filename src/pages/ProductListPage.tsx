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
import { getProducts } from '../data/products';
import { Product } from '../data/type_products';
import { useEffect, useState } from 'react';

interface RouteParams {
  categoryId: string;
}

const ProductListPage: React.FC = () => {
  const { categoryId } = useParams<RouteParams>();
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();
        console.log("Fetched products:", data);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Convert categoryId to number for correct comparison
  const categoryIdNumber = +categoryId; // Convert to number
  console.log("Category ID from URL:", categoryIdNumber);

  const filteredProducts = products.filter(p => p.categoryId === parseInt(categoryId, 10));


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Productos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
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
          ))
        ) : (
          <p>No products found in this category.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductListPage;
