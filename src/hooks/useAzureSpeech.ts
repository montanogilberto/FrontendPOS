import { useState, useEffect, useRef } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

interface Command {
  commandId: number;
  phrase: string;
  action: string;
}

interface UseAzureSpeechProps {
  commands: Command[];
  onFetchOrders: () => void;
  onUpdateOrderStatus: () => void;
  onSpeakOrdersSummary: () => void;
  onStopListening: () => void;
  onFetchOrderProductDetails: (orderId: number) => void;
  expandedOrderIds: number[];
  orderProductDetails: { [orderId: number]: any };
  readProductDetails: () => void;
}

const subscriptionKey = '8ML90ZtfRoPBf0ipy0lGndqDc2ZbbdRczCaN9kbnjOMQcU3P9r0xJQQJ99BBACYeBjFXJ3w3AAAYACOGZuS7';
const region = 'eastus';

export const useAzureSpeech = ({
  commands,
  onFetchOrders,
  onUpdateOrderStatus,
  onSpeakOrdersSummary,
  onStopListening,
  onFetchOrderProductDetails,
  expandedOrderIds,
  orderProductDetails,
  readProductDetails,
}: UseAzureSpeechProps) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [listeningForCommand, setListeningForCommand] = useState<boolean>(false);
  const [awaitingOrderId, setAwaitingOrderId] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const speechRecognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const speechSynthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
  speechConfig.speechRecognitionLanguage = 'es-MX';

  useEffect(() => {
    if (!speechSynthesizerRef.current) {
      speechSynthesizerRef.current = new SpeechSDK.SpeechSynthesizer(speechConfig);
    }
  }, []);

  // Remove automatic startPassiveListening on mount
  // Instead, start passive listening after user gesture in toggleListening

  // Store passiveRecognizer and audioContext in refs to persist between calls
  const passiveRecognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startPassiveListening = () => {
    if (passiveRecognizerRef.current) {
      passiveRecognizerRef.current.close();
      passiveRecognizerRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    audioContextRef.current = new AudioContext();

    // Resume AudioContext on user gesture if needed
    if (audioContextRef.current.state === 'suspended') {
      const resumeAudioContext = () => {
        audioContextRef.current?.resume();
        window.removeEventListener('click', resumeAudioContext);
        window.removeEventListener('keydown', resumeAudioContext);
      };
      window.addEventListener('click', resumeAudioContext);
      window.addEventListener('keydown', resumeAudioContext);
    }

    passiveRecognizerRef.current = new SpeechSDK.SpeechRecognizer(speechConfig);

    passiveRecognizerRef.current.recognizing = (s, e) => {
      setTranscript(e.result.text);
      console.log('Passive Recognizing:', e.result.text);
    };

    passiveRecognizerRef.current.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const recognizedText = e.result.text.toLowerCase();
        setTranscript(recognizedText);
        console.log('Passive Recognized:', recognizedText);
        if (!isListening && recognizedText.includes('asistente')) {
          speakText('en que puedo ayudarte');
          setListeningForCommand(true);
          setIsListening(true);
          passiveRecognizerRef.current?.stopContinuousRecognitionAsync(() => {
            passiveRecognizerRef.current?.close();
            passiveRecognizerRef.current = null;
          });
        }
      }
    };

    passiveRecognizerRef.current.canceled = (s, e) => {
      passiveRecognizerRef.current?.stopContinuousRecognitionAsync(() => {
        passiveRecognizerRef.current?.close();
        passiveRecognizerRef.current = null;
      });
    };

    passiveRecognizerRef.current.sessionStopped = (s, e) => {
      passiveRecognizerRef.current?.stopContinuousRecognitionAsync(() => {
        passiveRecognizerRef.current?.close();
        passiveRecognizerRef.current = null;
      });
    };

    passiveRecognizerRef.current.startContinuousRecognitionAsync();
  };

  // Modify toggleListening to start passive listening after user gesture
  const toggleListeningHandler = () => {
    if (isListening) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stopContinuousRecognitionAsync(() => {
          speechRecognizerRef.current?.close();
          speechRecognizerRef.current = null;
          setIsListening(false);
          setListeningForCommand(false);
          speakText('Asistente detenido.');
          // Restart passive listening after stopping active listening
          startPassiveListening();
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
            speakText('asistente activado');
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

  const toggleListening = () => {
    if (isListening) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stopContinuousRecognitionAsync(() => {
          speechRecognizerRef.current?.close();
          speechRecognizerRef.current = null;
          setIsListening(false);
          setListeningForCommand(false);
          speakText('Asistente detenido.');
          onStopListening();
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
            speakText('asistente activado');
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
        onFetchOrderProductDetails(orderId);
        speakText(`Mostrando detalles para la orden ${orderId}.`);
      } else {
        speakText('No pude entender el número de orden. Por favor, inténtelo de nuevo.');
      }
      return;
    }

    const matchedCommand = commands.find(cmd => command.includes(cmd.phrase.toLowerCase()));
    if (matchedCommand) {
      if (matchedCommand.phrase.toLowerCase() === 'lista de comandos') {
        readCommandsList();
        return;
      }
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
          onFetchOrders();
          break;
        case 'updateOrderStatus':
          onUpdateOrderStatus();
          break;
        case 'speakOrdersSummary':
          onSpeakOrdersSummary();
          break;
        case 'stopListening':
          onStopListening();
          break;
        default:
          speakText('Comando no reconocido. Por favor, intente de nuevo.');
      }
    } else {
      speakText('Comando no reconocido. Por favor, intente de nuevo.');
    }
  };

  const readCommandsList = () => {
    if (commands.length === 0) {
      speakText('No hay comandos disponibles para mostrar.');
      return;
    }
    let commandsText = 'Los comandos disponibles son: ';
    commands.forEach((cmd, index) => {
      commandsText += `${cmd.phrase}`;
      if (index < commands.length - 1) {
        commandsText += ', ';
      } else {
        commandsText += '.';
      }
    });
    speakText(commandsText);
  };

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

  return {
    isListening,
    listeningForCommand,
    transcript,
    toggleListening: toggleListeningHandler,
  };
};
