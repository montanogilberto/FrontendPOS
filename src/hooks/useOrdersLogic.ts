import { useState, useEffect, useRef } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { fetchOrders as apiFetchOrders, fetchOrderProductDetails as apiFetchOrderProductDetails, updateOrderStatus as apiUpdateOrderStatus, fetchCommands as apiFetchCommands } from '../api/ordersApi';

export const useOrdersLogic = () => {
  const [selectedTab, setSelectedTab] = useState<'enPreparacion' | 'listo' | 'todos'>('enPreparacion');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [orderProductDetails, setOrderProductDetails] = useState<{ [orderId: number]: any }>({});
  const [loadingProductDetails, setLoadingProductDetails] = useState<{ [orderId: number]: boolean }>({});
  const [errorProductDetails, setErrorProductDetails] = useState<{ [orderId: number]: string | null }>({});
  const [commands, setCommands] = useState<{ commandId: number; phrase: string; action: string }[]>([]);
  const [awaitingOrderId, setAwaitingOrderId] = useState<boolean>(false);
  const [listeningForCommand, setListeningForCommand] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  const speechRecognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const speechSynthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    '8ML90ZtfRoPBf0ipy0lGndqDc2ZbbdRczCaN9kbnjOMQcU3P9r0xJQQJ99BBACYeBjFXJ3w3AAAYACOGZuS7',
    'eastus'
  );
  speechConfig.speechRecognitionLanguage = 'es-MX';

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderProductDetails = async (orderId: number) => {
    setLoadingProductDetails(prev => ({ ...prev, [orderId]: true }));
    setErrorProductDetails(prev => ({ ...prev, [orderId]: null }));
    try {
      const data = await apiFetchOrderProductDetails(orderId);
      setOrderProductDetails(prev => ({ ...prev, [orderId]: data }));
    } catch (error) {
      setErrorProductDetails(prev => ({ ...prev, [orderId]: 'Failed to fetch product details' }));
    } finally {
      setLoadingProductDetails(prev => ({ ...prev, [orderId]: false }));
    }
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

      await apiUpdateOrderStatus(orderId, nextStatusId);

      fetchOrders();
    } catch (error) {
      setError('Failed to update order status');
    }
  };

  const fetchCommands = async () => {
    try {
      const data = await apiFetchCommands();
      setCommands(data);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCommands();
  }, []);

  // Speech synthesizer initialization
  useEffect(() => {
    if (!speechSynthesizerRef.current) {
      speechSynthesizerRef.current = new SpeechSDK.SpeechSynthesizer(speechConfig);
    }
  }, []);

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

  const parseOrderIdFromCommand = (command: string): number | null => {
    const regex = /orden(?: número)? (\d+)/i;
    const match = command.match(regex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  const handleVoiceCommand = (command: string) => {
    if (awaitingOrderId) {
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

  const stopListening = () => {
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.stopContinuousRecognitionAsync(() => {
        speechRecognizerRef.current?.close();
        speechRecognizerRef.current = null;
        setIsListening(false);
        setListeningForCommand(false);
        speakText('Asistente detenido.');
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
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
      setIsListening(true);

      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.close();
        speechRecognizerRef.current = null;
      }

      speechRecognizerRef.current = new SpeechSDK.SpeechRecognizer(speechConfig);

      speechRecognizerRef.current.recognizing = (s, e) => {
        setTranscript(e.result.text);
        console.log('Recognizing:', e.result.text);
      };

      speechRecognizerRef.current.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const recognizedText = e.result.text.toLowerCase();
          setTranscript(recognizedText);
          console.log('Recognized:', recognizedText);
          if (!listeningForCommand && recognizedText.includes('asistente')) {
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

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
    if (!expandedOrderIds.includes(orderId)) {
      fetchOrderProductDetails(orderId);
    }
  };

  const filterOrdersByStatus = (statusNames: string[]) => {
    return orders.filter(order => {
      const latestStatus = order.orderStatuses[0];
      return latestStatus && statusNames.includes(latestStatus.orderStatusName.toLowerCase());
    });
  };

  const getStatusChangedAt = (order: any, statusName: string): number => {
    const status = order.orderStatuses.find((s: any) => s.orderStatusName.toLowerCase() === statusName.toLowerCase());
    if (!status) return 0;
    const dateStr = status.orderTracking[0]?.statusChangedAt || '';
    return dateStr ? new Date(dateStr).getTime() : 0;
  };

  return {
    selectedTab,
    setSelectedTab,
    orders,
    loading,
    error,
    expandedOrderIds,
    orderProductDetails,
    loadingProductDetails,
    errorProductDetails,
    transcript,
    isListening,
    toggleListening,
    toggleOrderDetails,
    filterOrdersByStatus,
    getStatusChangedAt,
  };
};
