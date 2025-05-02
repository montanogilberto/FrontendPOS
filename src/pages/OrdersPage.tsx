import React, { useState, useEffect, useRef } from 'react';
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
  IonText,
  IonSpinner,
  IonToggle,
  IonListHeader,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
} from '@ionic/react';
import { Order } from '../data/orderTypes';

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const OrdersPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'enPreparacion' | 'listo' | 'todos'>('enPreparacion');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [orderProductDetails, setOrderProductDetails] = useState<{ [orderId: number]: any }>({});
  const [loadingProductDetails, setLoadingProductDetails] = useState<{ [orderId: number]: boolean }>({});
  const [errorProductDetails, setErrorProductDetails] = useState<{ [orderId: number]: string | null }>({});
  const [commands, setCommands] = useState<{ commandId: number; phrase: string; action: string }[]>([]);
  const [awaitingOrderId, setAwaitingOrderId] = useState<boolean>(false);
  const [listeningForCommand, setListeningForCommand] = useState<boolean>(false);

  // Azure Speech SDK related refs and state
  const speechRecognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const speechSynthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  // Azure Speech service config
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    '8ML90ZtfRoPBf0ipy0lGndqDc2ZbbdRczCaN9kbnjOMQcU3P9r0xJQQJ99BBACYeBjFXJ3w3AAAYACOGZuS7',
    'eastus'
  );
  speechConfig.speechRecognitionLanguage = 'es-MX'; // Spanish (Latin America) language for recognition

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://smartloansbackend.azurewebsites.net/list_orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch commands from backend
  const fetchCommands = async () => {
    try {
      const response = await fetch('https://smartloansbackend.azurewebsites.net/all_commands');
      if (!response.ok) {
        throw new Error('Failed to fetch commands');
      }
      const data = await response.json();
      setCommands(data.commands || []);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
  };

  // Initialize speech synthesizer
  useEffect(() => {
    if (!speechSynthesizerRef.current) {
      speechSynthesizerRef.current = new SpeechSDK.SpeechSynthesizer(speechConfig);
    }
  }, []);

  // Fetch commands on mount
  useEffect(() => {
    fetchCommands();
  }, []);

  // Start or stop speech recognition and listen for activation word "asistente"
  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stopContinuousRecognitionAsync(() => {
          speechRecognizerRef.current?.close();
          speechRecognizerRef.current = null;
          setIsListening(false);
          setListeningForCommand(false);
          speakText('Asistente detenido.');
        });
      }
    } else {
      // Start listening
      setIsListening(true);

      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.close();
        speechRecognizerRef.current = null;
      }

      speechRecognizerRef.current = new SpeechSDK.SpeechRecognizer(speechConfig);

      speechRecognizerRef.current.recognizing = (s, e) => {
        // Update partial transcript if needed
        setTranscript(e.result.text);
        console.log('Recognizing:', e.result.text);
      };

      speechRecognizerRef.current.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const recognizedText = e.result.text.toLowerCase();
          setTranscript(recognizedText);
          console.log('Recognized:', recognizedText);
          if (!listeningForCommand && recognizedText.includes('asistente')) {
            // Activation word detected, respond and listen for commands
            speakText('en que puedo ayudarte');
            setListeningForCommand(true);
          } else if (listeningForCommand) {
            handleVoiceCommand(recognizedText);
          }
        }
      };

      speechRecognizerRef.current.canceled = (s, e) => {
        setIsListening(false);
        setListeningForCommand(false);
        speechRecognizerRef.current?.stopContinuousRecognitionAsync();
      };

      speechRecognizerRef.current.sessionStopped = (s, e) => {
        setIsListening(false);
        setListeningForCommand(false);
        speechRecognizerRef.current?.stopContinuousRecognitionAsync();
      };

      speechRecognizerRef.current.startContinuousRecognitionAsync();
    }
  };

  // Listen for commands after activation
  const listenForCommand = () => {
    // No longer needed to restart recognizer, handled in startListening
  };

  // Helper to parse order ID from command text
  const parseOrderIdFromCommand = (command: string): number | null => {
    const regex = /orden(?: número)? (\d+)/i;
    const match = command.match(regex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  // Handle recognized voice commands dynamically with context awareness
  const handleVoiceCommand = (command: string) => {
    if (awaitingOrderId) {
      // Expecting order ID from user response
      const orderId = parseOrderIdFromCommand(command);
      if (orderId !== null) {
        setAwaitingOrderId(false);
        fetchOrderProductDetails(orderId);
        speakText(`Mostrando detalles para la orden ${orderId}.`);
      } else {
        speakText('No pude entender el número de orden. Por favor, inténtelo de nuevo.');
      }
      return;
    }

    const matchedCommand = commands.find(cmd => command.includes(cmd.phrase.toLowerCase()));
    if (matchedCommand) {
      switch (matchedCommand.action) {
        case 'readProductDetails':
          // Check if order details are expanded, else ask for order ID
          if (expandedOrderIds.length === 1) {
            readProductDetails();
          } else if (expandedOrderIds.length > 1) {
            speakText('Por favor, indique el número de orden para mostrar los detalles.');
            setAwaitingOrderId(true);
          } else {
            speakText('No hay órdenes expandidas. Por favor, indique el número de orden para mostrar los detalles.');
            setAwaitingOrderId(true);
          }
          break;
        case 'fetchOrders':
          fetchOrders();
          break;
        case 'updateOrderStatus':
          // For updateOrderStatus, we might need orderId, but here just call fetchOrders as placeholder
          fetchOrders();
          break;
        case 'speakOrdersSummary':
          speakOrdersSummary();
          break;
        case 'stopListening':
          stopListening();
          break;
        default:
          speakText('Comando no reconocido. Por favor, intente de nuevo.');
      }
    } else {
      speakText('Comando no reconocido. Por favor, intente de nuevo.');
    }
  };

  // Use speech synthesizer to speak text
  const speakText = (text: string) => {
    console.log('Speaking text:', text);
    if (speechSynthesizerRef.current) {
      speechSynthesizerRef.current.speakTextAsync(
        text,
        () => {},
        (error) => {
          console.error('Speech synthesis error:', error);
        }
      );
    }
  };

  // Speak a summary of orders
  const speakOrdersSummary = () => {
    if (orders.length === 0) {
      speakText('No hay órdenes para leer.');
      return;
    }
    let summary = `Hay ${orders.length} órdenes. `;
    orders.forEach(order => {
      const latestStatus = order.orderStatuses[0];
      const statusName = latestStatus?.orderStatusName || 'desconocido';
      summary += `Orden ${order.orderId} en la mesa ${order.tableNumber} está ${statusName}. `;
    });
    speakText(summary);
  };

  // Stop the speech recognizer
  const stopListening = () => {
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.stopContinuousRecognitionAsync(() => {
        speechRecognizerRef.current?.close();
        speechRecognizerRef.current = null;
        setIsListening(false);
        speakText('Asistente detenido.');
      });
    }
  };

  // Read out product details of expanded orders
  const readProductDetails = () => {
    if (expandedOrderIds.length === 0) {
      speakText('No hay órdenes expandidas para leer.');
      return;
    }
    expandedOrderIds.forEach(orderId => {
      const details = orderProductDetails[orderId];
      if (!details) {
        speakText(`No hay detalles disponibles para la orden ${orderId}.`);
        return;
      }
      let speechText = `Detalles de la orden ${orderId}: `;
      details.products.forEach((product: any) => {
        speechText += `${product.productName}, `;
        product.po.forEach((option: any) => {
          speechText += `${option.optionName}: `;
          option.poc.forEach((choice: any) => {
            speechText += `${choice.choiceName}, `;
          });
        });
      });
      speakText(speechText);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filterOrdersByStatus = (statusNames: string[]) => {
    return orders.filter(order => {
      const latestStatus = order.orderStatuses[0];
      return latestStatus && statusNames.includes(latestStatus.orderStatusName.toLowerCase());
    });
  };

  const getStatusChangedAt = (order: Order, statusName: string): number => {
    const status = order.orderStatuses.find(s => s.orderStatusName.toLowerCase() === statusName.toLowerCase());
    if (!status) return 0;
    const dateStr = status.orderTracking[0]?.statusChangedAt || '';
    return dateStr ? new Date(dateStr).getTime() : 0;
  };

  const updateOrderStatus = async (orderId: number) => {
    try {
      const order = orders.find(o => o.orderId === orderId);
      if (!order) {
        setError('Order not found');
        return;
      }
      const latestStatus = order.orderStatuses[0];
      const currentStatusName = latestStatus?.orderStatusName.toLowerCase() || 'pending';

      const statusProgression: { [key: string]: number } = {
        pending: 2,
        preparing: 3,
        done: 3,
        cancel: 4,
      };

      const nextStatusId = statusProgression[currentStatusName] || 1;

      const response = await fetch('https://smartloansbackend.azurewebsites.net/tracking_status_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordersTraking: [
            {
              orderId,
              userId: 1,
              statusTrakingId: nextStatusId,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      fetchOrders();

    } catch (error) {
      setError('Failed to update order status');
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
    if (!expandedOrderIds.includes(orderId)) {
      fetchOrderProductDetails(orderId);
    }
  };

  const fetchOrderProductDetails = async (orderId: number) => {
    setLoadingProductDetails(prev => ({ ...prev, [orderId]: true }));
    setErrorProductDetails(prev => ({ ...prev, [orderId]: null }));
    try {
      const response = await fetch('https://smartloansbackend.azurewebsites.net/one_products_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: [{ orderId }] }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }
      const data = await response.json();
      setOrderProductDetails(prev => ({ ...prev, [orderId]: data.orderedProducts[0] || null }));
    } catch (error) {
      setErrorProductDetails(prev => ({ ...prev, [orderId]: 'Failed to fetch product details' }));
    } finally {
      setLoadingProductDetails(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const renderOrderItem = (order: Order) => {
    const latestStatus = order.orderStatuses[0];
    const statusName = latestStatus?.orderStatusName || 'Unknown';
    const statusColor = latestStatus?.orderStatusColor || 'black';
    const statusChangedAt = latestStatus?.orderTracking[0]?.statusChangedAt || '';

    const isInPreparation = statusName.toLowerCase() === 'preparing';
    const isExpanded = expandedOrderIds.includes(order.orderId);
    const productDetails = orderProductDetails[order.orderId];
    const loadingDetails = loadingProductDetails[order.orderId];
    const errorDetails = errorProductDetails[order.orderId];

    return (
      <React.Fragment key={order.orderId}>
        <IonItem>
          <IonLabel>
            <h2>Orden #{order.orderId} - Table {order.tableNumber}</h2>
            <p>Total: ${order.total.toFixed(2)}</p>
            <p>Status: <IonText style={{ color: statusColor, fontWeight: 'bold', borderRadius: '8px' }}>{statusName}</IonText></p>
            <p>Ultima Actualizacion: {new Date(statusChangedAt).toLocaleTimeString()}</p>
            {order.comments && <p>Comments: {order.comments}</p>}
            <p
              style={{ cursor: 'pointer', color: 'blue', marginLeft: '10px', textDecoration: 'underline' }}
              onClick={() => toggleOrderDetails(order.orderId)}
            >
              {isExpanded ? 'Hide Product Details' : 'Show Product Details'}
            </p>
          </IonLabel>
          {selectedTab === 'enPreparacion' && (
            <IonToggle
              checked={isInPreparation}
              onIonChange={() => updateOrderStatus(order.orderId)}
              slot="end"
              aria-label="Update order status"
            />
          )}
        </IonItem>
        {isExpanded && (
          <IonList>
            {loadingDetails && <IonItem><IonLabel>Loading product details...</IonLabel></IonItem>}
            {errorDetails && <IonItem><IonLabel color="danger">{errorDetails}</IonLabel></IonItem>}
            {productDetails && (
              <>
                {productDetails.products?.map((product: any, index: number) => (
                  <IonCard key={index}>
                    <IonCardHeader>
                      <IonCardTitle>{product.productName}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {product.po?.map((option: any) => (
                        <div key={option.productOptionId} style={{ marginLeft: '10px' }}>
                          <strong>{option.optionName}:</strong>
                          <ul>
                            {option.poc?.map((choice: any) => (
                              <li key={choice.productOptionChoiceId}>
                                {choice.choiceName} {choice.choicePrice > 0 ? `($${choice.choicePrice.toFixed(2)})` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </IonCardContent>
                  </IonCard>
                ))}
              </>
            )}
          </IonList>
        )}
      </React.Fragment>
    );
  };

  let content;

  if (loading) {
    content = <IonSpinner name="crescent" />;
  } else if (error) {
    content = <IonText color="danger">{error}</IonText>;
  } else {
    if (selectedTab === 'enPreparacion') {
      const preparingOrders = filterOrdersByStatus(['preparing']).sort(
        (a, b) => getStatusChangedAt(b, 'preparing') - getStatusChangedAt(a, 'preparing')
      );
      const pendingOrders = filterOrdersByStatus(['pending']).sort(
        (a, b) => getStatusChangedAt(b, 'pending') - getStatusChangedAt(a, 'pending')
      );

      content = (
        <>
          <IonList>
            <IonListHeader>En preparacion</IonListHeader>
            {preparingOrders.length > 0 ? preparingOrders.map(renderOrderItem) : (
              <IonItem>
                <IonLabel>No orders preparing.</IonLabel>
              </IonItem>
            )}
          </IonList>
          <IonList>
            <IonListHeader>Pendientes</IonListHeader>
            {pendingOrders.length > 0 ? pendingOrders.map(renderOrderItem) : (
              <IonItem>
                <IonLabel>No orders pending.</IonLabel>
              </IonItem>
            )}
          </IonList>
        </>
      );
    } else if (selectedTab === 'listo') {
      const filtered = filterOrdersByStatus(['done']);
      content = filtered.length > 0 ? (
        <IonList>{filtered.map(renderOrderItem)}</IonList>
      ) : (
        <IonList>
          <IonItem>
            <IonLabel>No orders listos.</IonLabel>
          </IonItem>
        </IonList>
      );
    } else {
      content = orders.length > 0 ? (
        <IonList>{orders.map(renderOrderItem)}</IonList>
      ) : (
        <IonList>
          <IonItem>
            <IonLabel>No orders.</IonLabel>
          </IonItem>
        </IonList>
      );
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Orders</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as any)}>
            <IonSegmentButton value="enPreparacion">
              <IonLabel>Preparacion</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="listo">
              <IonLabel>Listos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="todos">
              <IonLabel>Todos</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          <IonButton onClick={toggleListening} fill="clear" slot="end" aria-label="Toggle Assistant">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isListening ? 'red' : 'black'}
              width="24px"
              height="24px"
            >
              <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="23" stroke={isListening ? 'red' : 'black'} strokeWidth="2" />
              <line x1="8" y1="23" x2="16" y2="23" stroke={isListening ? 'red' : 'black'} strokeWidth="2" />
            </svg>
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>{content}</IonContent>
    </IonPage>
  );
};

export default OrdersPage;
