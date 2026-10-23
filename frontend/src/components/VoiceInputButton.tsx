import React, { useState, useEffect } from 'react';
import {
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
  speakPrompt,
  cancelSpeech,
} from '../services/speechService';
import { voiceApi } from '../services/voiceApi';

interface VoiceInputButtonProps {
  fieldKey: string;
  label: string;
  dataType?: string;
  language?: string; // 'en' | 'te'
  currentValue?: string;
  serviceCode?: string;
  applicationId?: number;
  onValueConfirmed: (fieldKey: string, value: string) => void;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  fieldKey,
  label,
  dataType = 'TEXT',
  language = 'en',
  currentValue: _currentValue = '',
  serviceCode = 'SRV_GENERIC',
  applicationId,
  onValueConfirmed,
  className = '',
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0.85);
  const [startTime, setStartTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [correctionCount, setCorrectionCount] = useState<number>(0);

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  const speechLang = language === 'te' ? 'te-IN' : 'en-IN';

  const handleStartListening = () => {
    if (!isSupported) return;
    setErrorMsg(null);
    setPendingValue(null);
    setInterimText('');
    setStartTime(Date.now());
    setIsListening(true);

    const started = startListening({
      lang: speechLang,
      onInterimResult: (text) => {
        setInterimText(text);
      },
      onFinalResult: async (finalText, conf) => {
        setIsListening(false);
        setConfidence(conf);

        try {
          // Normalize through backend rule engine
          const normRes = await voiceApi.normalize({
            fieldKey,
            rawTranscript: finalText,
            language,
            dataType,
          });

          const normalized = normRes.normalizedValue || finalText;
          setPendingValue(normalized);

          // Audio readback confirmation
          const readbackMsg = language === 'te'
            ? `మీరు ${normalized} అన్నారు. ఇది సరైనదా?`
            : `You said ${normalized}. Is this correct?`;

          speakPrompt(readbackMsg, { lang: speechLang });
        } catch (err: any) {
          console.warn('Normalization failed, using raw transcript:', err);
          setPendingValue(finalText);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMsg(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setIsListening(false);
      setErrorMsg('Could not initialize microphone.');
    }
  };

  const handleStopListening = () => {
    stopListening();
    setIsListening(false);
  };

  const handleConfirmValue = async () => {
    if (!pendingValue) return;
    cancelSpeech();

    const durationMs = startTime > 0 ? Date.now() - startTime : 1500;

    // Log telemetry to backend
    try {
      await voiceApi.recordTelemetry({
        applicationId,
        serviceCode,
        fieldKey,
        language: speechLang,
        rawTranscript: interimText || pendingValue,
        normalizedValue: pendingValue,
        confidenceScore: confidence,
        durationMs,
        correctionCount,
        confirmedByUser: true,
        inputMode: 'VOICE',
      });
    } catch (e) {
      console.warn('Could not record voice telemetry:', e);
    }

    onValueConfirmed(fieldKey, pendingValue);
    setPendingValue(null);
    setInterimText('');
  };

  const handleRejectValue = () => {
    cancelSpeech();
    setCorrectionCount((prev) => prev + 1);
    setPendingValue(null);
    setInterimText('');
    // Prompt to speak again
    const retryMsg = language === 'te'
      ? 'సరే, దయచేసి మళ్ళీ చెప్పండి.'
      : 'Okay, please speak again.';
    speakPrompt(retryMsg, { lang: speechLang });
    handleStartListening();
  };

  if (!isSupported) {
    return (
      <span
        title="Web Speech API not supported in this browser. Please use standard keyboard input."
        className="text-gray-400 text-xs italic ml-2 cursor-help"
      >
        (Voice unavailable)
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Mic Trigger Button */}
      {!isListening && !pendingValue && (
        <button
          type="button"
          onClick={handleStartListening}
          title={`Speak ${label} (${language === 'te' ? 'తెలుగు' : 'English'})`}
          className="p-1.5 rounded-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      )}

      {/* Listening State (Pulsing Mic) */}
      {isListening && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-full text-xs animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <span>{language === 'te' ? 'వింటున్నాను...' : 'Listening...'}</span>
          <button
            type="button"
            onClick={handleStopListening}
            className="text-red-700 hover:text-red-900 font-bold ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pending Confirmation State */}
      {pendingValue && (
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-300 text-green-900 px-2 py-0.5 rounded-lg text-xs shadow-sm">
          <span className="font-semibold text-gray-700 truncate max-w-[120px]" title={pendingValue}>
            "{pendingValue}"
          </span>
          <button
            type="button"
            onClick={handleConfirmValue}
            title={language === 'te' ? 'సరైనది - నిర్ధారించండి' : 'Confirm value'}
            className="p-1 bg-green-600 hover:bg-green-700 text-white rounded focus:ring-2 focus:ring-green-400"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleRejectValue}
            title={language === 'te' ? 'తప్పు - మళ్ళీ చెప్పండి' : 'Retry input'}
            className="p-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded focus:ring-2 focus:ring-gray-400"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Interim live speech preview */}
      {isListening && interimText && (
        <span className="text-xs text-gray-500 italic max-w-[140px] truncate" title={interimText}>
          "{interimText}"
        </span>
      )}

      {/* Error message */}
      {errorMsg && (
        <span className="text-xs text-red-500 italic ml-1" title={errorMsg}>
          ({errorMsg})
        </span>
      )}
    </div>
  );
};
