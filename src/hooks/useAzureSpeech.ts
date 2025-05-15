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
    toggleListeningHandler();
  };

  const parseOrderIdFromCommand = (command: string): number | null => {
    const regex = /orden(?: número)? (\d+)/i;
    const match = command.match(regex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  const [confirmationPending, setConfirmationPending] = useState<boolean>(false);
  const [commandToConfirm, setCommandToConfirm] = useState<Command | null>(null);

  // Simple Levenshtein distance implementation for fuzzy matching
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: b.length + 1 }, () => new Array(a.length + 1).fill(0));
    for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  // Calculate similarity score between 0 and 1
  const similarity = (a: string, b: string): number => {
    const distance = levenshteinDistance(a, b);
    return 1 - distance / Math.max(a.length, b.length);
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
  
    if (confirmationPending) {
      const lowerCommand = command.toLowerCase();
      if (lowerCommand === 'sí' || lowerCommand === 'si') {
        if (commandToConfirm) {
          speakText(`Ejecutando la acción ${commandToConfirm.phrase}.`);
          executeCommandAction(commandToConfirm);
        }
      } else {
        speakText('Acción cancelada.');
      }
      setConfirmationPending(false);
      setCommandToConfirm(null);
      return;
    }
  
    let bestMatch: Command | null = null;
    let bestScore = 0.0;
    const threshold = 0.4; // lowered similarity threshold for testing
  
    const normalizedCommand = command.trim().replace(/[.,!?]$/, '').toLowerCase();
  
    console.log('handleVoiceCommand received:', normalizedCommand);
    console.log('Commands array:', commands);
  
    (commands as unknown as Command[]).forEach((cmd) => {
      const score = similarity(normalizedCommand, cmd.phrase.toLowerCase());
      console.log(`Comparing with command: ${cmd.phrase}, similarity: ${score}`);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = cmd;
      }
    });
  
    if (bestMatch && bestScore >= threshold) {
      const phrase = (bestMatch as Command).phrase;
      if (phrase.toLowerCase() === 'lista de comandos') {
        readCommandsList();
        return;
      }
      speakText(`Deseas aplicar esta acción: ${phrase}? Menciona la acción para confirmar.`);
      setConfirmationPending(true);
      setCommandToConfirm(bestMatch);
    } else {
      console.log('No matching command found.');
      speakText('Comando no reconocido. Por favor, intente de nuevo.');
    }
  };
  

  const executeCommandAction = (cmd: Command) => {
    switch (cmd.action) {
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
