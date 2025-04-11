import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonCheckbox,
  IonList,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonBackButton,
  IonButtons,
  IonAlert
} from '@ionic/react';

import { useParams, useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

// Assuming you have a function to fetch products dynamically (or static import)
import { getProducts } from '../data/products';
import { Product } from '../data/type_products';

interface RouteParams {
  productId: string;
}

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<RouteParams>();
  const history = useHistory();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | undefined>(undefined); // Initialize state to hold product
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: any }>({});
  const [showAlert, setShowAlert] = useState(false);
  const [missingMessage, setMissingMessage] = useState('');

  console.log("productId ID from URL:", productId);

  // Fetch product details on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      const products = await getProducts(); // Fetch the products dynamically
  
      // Filter and get the first matching product
      const foundProduct = products.find(p => p.id === parseInt(productId, 10));
      
      // Set the found product (single product, not an array)
      setProduct(foundProduct);
    };
    fetchProduct();
  }, [productId]);

  if (!product) return <IonPage><IonContent><p>Producto no encontrado.</p></IonContent></IonPage>;

  const handleRadioChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }));
  };

  const handleCheckboxChange = (optionId: string, value: string) => {
    const currentValues = selectedOptions[optionId] || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];

    setSelectedOptions((prev) => ({ ...prev, [optionId]: updatedValues }));
  };

  const handleSelectAll = (optionId: string, allIds: string[]) => {
    const current = selectedOptions[optionId] || [];
    const isAllSelected = current.length === allIds.length;
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: isAllSelected ? [] : [...allIds],
    }));
  };

  const calculateOptionPrice = () => {
    let extra = 0;
    product.options?.forEach(option => {
      const value = selectedOptions[option.id];
      if (option.type === 'radio' && value) {
        const selected = option.choices.find(c => c.id === value);
        extra += selected?.price || 0;
      }
      if (option.type === 'checkbox' && Array.isArray(value)) {
        value.forEach((id: string) => {
          const selected = option.choices.find(c => c.id === id);
          extra += selected?.price || 0;
        });
      }
    });
    return extra;
  };

  const handleAddToCart = () => {
    const requiredOptions = product.options || [];
    const missingGroups: string[] = [];
  
    requiredOptions.forEach((option) => {
      const value = selectedOptions[option.id];
  
      if (option.type === 'radio' && !value) {
        missingGroups.push(option.name);
      }
  
      if (option.type === 'checkbox' && (!Array.isArray(value) || value.length === 0)) {
        missingGroups.push(option.name);
      }
    });
  
    if (missingGroups.length > 0) {
      setMissingMessage(
        `Falta seleccionar ${missingGroups.length === 1 ? 'la opción' : 'las opciones'}: ` +
        `${missingGroups.map(name => `"${name}"`).join(', ')}.`
      );

      setShowAlert(true);
      return;
    }
  
    const basePrice = product.price;
    const optionPrice = calculateOptionPrice();
    const finalPrice = basePrice + optionPrice;
  
    addToCart({
      id: String(product.id), // Use product.id or generate a unique ID for cart items
      productId: String(product.id),
      name: product.name,
      quantity,
      price: finalPrice,
      selectedOptions,
    });
  
    history.push('/cart');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>{product.name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonCard>
          <img src={product.image} alt={product.name} />
          <IonCardHeader>
            <IonCardTitle>${product.price}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{product.description}</p>

            {product.options?.map((option) => (
              <IonList key={option.id}>
                <IonItem>
                  <IonLabel>{option.name}</IonLabel>
                </IonItem>

                {option.type === 'checkbox' && (
                  <>
                    <IonItem>
                      <IonLabel>Seleccionar todos</IonLabel>
                      <IonCheckbox
                        slot="start"
                        checked={
                          selectedOptions[option.id]?.length === option.choices.length
                        }
                        onIonChange={() =>
                          handleSelectAll(option.id, option.choices.map((c) => c.id))
                        }
                      />
                    </IonItem>
                    {option.choices.map((choice) => (
                      <IonItem key={choice.id}>
                        <IonLabel>{choice.name} (+${choice.price})</IonLabel>
                        <IonCheckbox
                          slot="start"
                          checked={selectedOptions[option.id]?.includes(choice.id)}
                          onIonChange={() => handleCheckboxChange(option.id, choice.id)}
                        />
                      </IonItem>
                    ))}
                  </>
                )}

                {option.type === 'radio' && (
                  <IonRadioGroup
                    value={selectedOptions[option.id] || ''}
                    onIonChange={(e) =>
                      handleRadioChange(option.id, e.detail.value)
                    }
                  >
                    {option.choices.map((choice) => (
                      <IonItem key={choice.id}>
                        <IonLabel>{choice.name} (+${choice.price})</IonLabel>
                        <IonRadio slot="start" value={choice.id} />
                      </IonItem>
                    ))}
                  </IonRadioGroup>
                )}
              </IonList>
            ))}

            <IonItem>
              <IonLabel position="stacked">Cantidad</IonLabel>
              <IonSelect
                value={quantity}
                onIonChange={(e) => setQuantity(Number(e.detail.value))}
                interface="popover"
              >
                {[...Array(10)].map((_, i) => (
                  <IonSelectOption key={i + 1} value={i + 1}>
                    {i + 1}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonButton expand="block" onClick={handleAddToCart}>
              Agregar al carrito
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Opciones requeridas"
          message={missingMessage}
          buttons={['OK']}
          translucent={true}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProductDetailPage;
