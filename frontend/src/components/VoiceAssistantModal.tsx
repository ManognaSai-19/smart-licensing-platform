import React, { useState, useEffect, useRef } from 'react';
import { VoicePrompt, VoiceServiceGuidanceResponse } from '../types/voice';
import { voiceApi } from '../services/voiceApi';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  startListening,
  stopListening,
  speakPrompt,
  cancelSpeech,
} from '../services/speechService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  serviceCode: string;
  serviceName: string;
  initialLanguage?: 'en' | 'te';
  applicationId?: number;
  initialFormData?: Record<string, any>;
  onClose: () => void;
  onFormUpdate: (updatedFormData: Record<string, any>) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  serviceCode,
  serviceName,
  initialLanguage = 'en',
  applicationId,
  initialFormData = {},
  onClose,
  onFormUpdate,
}) => {
  const [language, setLanguage] = useState<'en' | 'te'>(initialLanguage);
  const [guidance, setGuidance] = useState<VoiceServiceGuidanceResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialFormData);
  const [loading, setLoading] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [pendingConfirmation, setPendingConfirmation] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0.9);
  const [correctionCount, setCorrectionCount] = useState<number>(0);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const speechLang = language === 'te' ? 'te-IN' : 'en-IN';
  const hasSpokenWelcomeRef = useRef(false);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  // Fetch prompts when modal opens or language changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    voiceApi
      .getPrompts(serviceCode, language)
      .then((data) => {
        if (isMounted) {
          setGuidance(data);
          setLoading(false);
          // Play welcome on first launch
          if (!hasSpokenWelcomeRef.current) {
            hasSpokenWelcomeRef.current = true;
            playPromptAudio(data.welcomePrompt, () => {
              if (data.fields && data.fields.length > 0) {
                promptCurrentField(data.fields[0]);
              }
            });
          } else {
            if (data.fields && data.fields[currentIndex]) {
              promptCurrentField(data.fields[currentIndex]);
            }
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load voice guidance:', err);
          setErrorMsg('Could not load voice guidance for this service.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      cancelSpeech();
      stopListening();
    };
  }, [isOpen, serviceCode, language]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      cancelSpeech();
      stopListening();
      setIsListening(false);
      setIsSpeaking(false);
      hasSpokenWelcomeRef.current = false;
    }
  }, [isOpen]);

  const currentField: VoicePrompt | undefined = guidance?.fields[currentIndex];

  const playPromptAudio = (text: string, onFinished?: () => void) => {
    if (!isSpeechSynthesisSupported()) {
      if (onFinished) onFinished();
      return;
    }
    stopListening();
    setIsSpeaking(true);
    speakPrompt(text, {
      lang: speechLang,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        if (onFinished) onFinished();
      },
      onError: () => {
        setIsSpeaking(false);
        if (onFinished) onFinished();
      },
    });
  };

  const promptCurrentField = (field: VoicePrompt) => {
    if (!field) return;
    setPendingConfirmation(null);
    setInterimTranscript('');
    setErrorMsg(null);
    setStepStartTime(Date.now());

    playPromptAudio(field.spokenPrompt, () => {
      // Automatically start listening after asking question
      listenForFieldInput(field);
    });
  };

  const listenForFieldInput = (field: VoicePrompt) => {
    if (!speechSupported) return;
    stopListening();
    setIsListening(true);
    setInterimTranscript('');

    startListening({
      lang: speechLang,
      onInterimResult: (text) => {
        setInterimTranscript(text);
      },
      onFinalResult: async (finalText, conf) => {
        setIsListening(false);
        setConfidence(conf);

        try {
          // Normalize transcript through backend
          const norm = await voiceApi.normalize({
            fieldKey: field.fieldKey,
            rawTranscript: finalText,
            language,
            dataType: field.dataType,
          });

          // Check if user spoke a confirmation response instead
          if (norm.detectedIntent === 'CONFIRM_YES' && pendingConfirmation) {
            handleConfirmStep();
            return;
          } else if (norm.detectedIntent === 'CONFIRM_NO' && pendingConfirmation) {
            handleRejectStep();
            return;
          }

          const valueToConfirm = norm.normalizedValue || finalText;
          setPendingConfirmation(valueToConfirm);

          // Audio read-back
          const readbackMsg = language === 'te'
            ? `మీరు ${valueToConfirm} అన్నారు. ఇది సరైనదా? అవును లేదా కాదు అని చెప్పండి.`
            : `You said ${valueToConfirm}. Is this correct? Say yes to confirm or no to repeat.`;

          playPromptAudio(readbackMsg, () => {
            listenForConfirmation();
          });
        } catch (e) {
          console.warn('Normalization error:', e);
          setPendingConfirmation(finalText);
          listenForConfirmation();
        }
      },
      onError: (err) => {
        setIsListening(false);
        if (err !== 'no-speech') {
          setErrorMsg(err);
        }
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const listenForConfirmation = () => {
    if (!speechSupported) return;
    stopListening();
    setIsListening(true);

    startListening({
      lang: speechLang,
      onInterimResult: (text) => setInterimTranscript(text),
      onFinalResult: async (transcript) => {
        setIsListening(false);
        const norm = await voiceApi.normalize({
          rawTranscript: transcript,
          language,
        });

        if (norm.detectedIntent === 'CONFIRM_YES') {
          handleConfirmStep();
        } else if (norm.detectedIntent === 'CONFIRM_NO') {
          handleRejectStep();
        } else {
          // Spoke something else, treat as a correction or new input
          setPendingConfirmation(norm.normalizedValue);
          listenForConfirmation();
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });
  };

  const handleConfirmStep = async () => {
    if (!currentField || !pendingConfirmation) return;
    cancelSpeech();
    stopListening();

    const durationMs = Date.now() - stepStartTime;
    const updated = {
      ...formData,
      [currentField.fieldKey]: pendingConfirmation,
    };
    setFormData(updated);
    onFormUpdate(updated);

    // Record research telemetry
    try {
      await voiceApi.recordTelemetry({
        applicationId,
        serviceCode,
        fieldKey: currentField.fieldKey,
        language: speechLang,
        rawTranscript: interimTranscript || pendingConfirmation,
        normalizedValue: pendingConfirmation,
        confidenceScore: confidence,
        durationMs,
        correctionCount,
        confirmedByUser: true,
        inputMode: 'VOICE',
      });
    } catch (e) {
      console.warn('Telemetry error:', e);
    }

    setCorrectionCount(0);
    setPendingConfirmation(null);
    setInterimTranscript('');

    // Advance to next step or complete
    if (guidance && currentIndex < guidance.fields.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      promptCurrentField(guidance.fields[nextIdx]);
    } else {
      // Completed all fields
      playPromptAudio(guidance?.completionPrompt || 'Application fields completed.', () => {
        setTimeout(() => {
          onClose();
        }, 1500);
      });
    }
  };

  const handleRejectStep = () => {
    cancelSpeech();
    stopListening();
    setCorrectionCount((prev) => prev + 1);
    setPendingConfirmation(null);
    setInterimTranscript('');

    const retryMsg = language === 'te'
      ? 'సరే, దయచేసి మళ్ళీ స్పష్టంగా చెప్పండి.'
      : 'Understood. Please say it again clearly.';

    playPromptAudio(retryMsg, () => {
      if (currentField) {
        listenForFieldInput(currentField);
      }
    });
  };

  const handleManualNext = () => {
    cancelSpeech();
    stopListening();
    if (guidance && currentIndex < guidance.fields.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      promptCurrentField(guidance.fields[nextIdx]);
    } else {
      onClose();
    }
  };

  const handleManualPrev = () => {
    cancelSpeech();
    stopListening();
    if (currentIndex > 0 && guidance) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      promptCurrentField(guidance.fields[prevIdx]);
    }
  };

  const handleReplayPrompt = () => {
    if (currentField) {
      promptCurrentField(currentField);
    }
  };

  if (!isOpen) return null;

  const totalFields = guidance?.fields.length || 0;
  const progressPercent = totalFields > 0 ? Math.round(((currentIndex + 1) / totalFields) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#101828] via-[#162544] to-[#2563EB] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center backdrop-blur-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
                <span>{language === 'te' ? 'వాయిస్ సహాయకుడు' : 'Voice Assistant'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAF2FF]/20 text-[#EAF2FF]">
                  {language === 'te' ? 'తెలుగు' : 'English'}
                </span>
              </h2>
              <p className="text-xs text-indigo-200">{serviceName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="bg-indigo-900 bg-opacity-60 rounded-lg p-1 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  language === 'en' ? 'bg-white text-indigo-900 shadow' : 'text-indigo-200 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  language === 'te' ? 'bg-white text-indigo-900 shadow' : 'text-indigo-200 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Unsupported Browser Alert */}
          {!speechSupported && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold">Web Speech Recognition not supported in this browser</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Voice recognition features require a browser supporting the Web Speech API (such as Chrome or Edge). You can safely close this assistant and complete the application using standard keyboard input.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">
                {language === 'te' ? 'సహాయకుడిని లోడ్ చేస్తున్నాము...' : 'Loading voice assistant...'}
              </p>
            </div>
          ) : currentField ? (
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
                <span>
                  {language === 'te' ? `విభాగం ${currentIndex + 1} / ${totalFields}` : `Field ${currentIndex + 1} of ${totalFields}`}
                </span>
                <span className="text-indigo-600 font-medium">
                  {currentField.isRequired ? (language === 'te' ? 'తప్పనిసరి' : 'Required') : (language === 'te' ? 'ఐచ్ఛికం' : 'Optional')}
                </span>
              </div>

              {/* Main Spoken Question Card */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-indigo-200 text-indigo-900">
                      {currentField.label}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                      {currentField.spokenPrompt}
                    </h3>
                    {currentField.spokenExample && (
                      <p className="text-sm text-indigo-700 font-medium italic">
                        {currentField.spokenExample}
                      </p>
                    )}
                  </div>

                  {/* Replay audio prompt button */}
                  <button
                    type="button"
                    onClick={handleReplayPrompt}
                    title={language === 'te' ? 'మళ్ళీ వినండి' : 'Replay question'}
                    className="p-2.5 rounded-full bg-white text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 shadow-sm border border-indigo-200 transition-colors flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Speaking/Audio state wave indicator */}
                {isSpeaking && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-800">
                    <span className="flex space-x-1 items-end h-4">
                      <span className="w-1 bg-indigo-600 h-2 animate-bounce"></span>
                      <span className="w-1 bg-indigo-600 h-4 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 bg-indigo-600 h-3 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </span>
                    <span>{language === 'te' ? 'మాట్లాడుతున్నాను...' : 'Speaking prompt...'}</span>
                  </div>
                )}
              </div>

              {/* Live Listening and Speech Wave Area */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl space-y-4 bg-gray-50">
                {isListening ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-red-500 animate-ping absolute inset-0 opacity-75"></div>
                      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg relative">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-red-600 animate-pulse">
                      {language === 'te' ? 'మీ వాయిస్ వింటున్నాను, స్పష్టంగా చెప్పండి...' : 'Listening... Speak clearly into your mic'}
                    </p>
                    {interimTranscript && (
                      <p className="text-base font-medium text-gray-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                        "{interimTranscript}"
                      </p>
                    )}
                  </div>
                ) : pendingConfirmation ? (
                  /* Audio Read-back Confirmation View */
                  <div className="w-full text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        {language === 'te' ? 'మీరు చెప్పిన విలువ' : 'Captured Value'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        "{pendingConfirmation}"
                      </p>
                    </div>
                    <p className="text-sm text-indigo-700 font-medium">
                      {language === 'te'
                        ? 'ఇది సరైనదేనా? నిర్ధారించడానికి "అవును" అనండి లేదా క్రింది బటన్ నొక్కండి.'
                        : 'Is this correct? Say "Yes" or click Confirm below.'}
                    </p>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleConfirmStep}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{language === 'te' ? 'అవును, సరైనది' : 'Yes, Confirm'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectStep}
                        className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>{language === 'te' ? 'కాదు, మార్చండి' : 'No, Retry'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Idle State - Click to speak */
                  <div className="flex flex-col items-center space-y-3">
                    <button
                      type="button"
                      onClick={() => listenForFieldInput(currentField)}
                      className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center transition-transform hover:scale-105"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-500 font-medium">
                      {language === 'te' ? 'మాట్లాడటానికి మైక్ బటన్ నొక్కండి' : 'Click microphone to speak'}
                    </p>
                  </div>
                )}

                {errorMsg && (
                  <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
                )}
              </div>

              {/* Current value badge if field is already populated */}
              {formData[currentField.fieldKey] && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    {language === 'te' ? 'ప్రస్తుత నమోదు:' : 'Current Saved Value:'}
                  </span>
                  <span className="font-bold text-gray-800">
                    {formData[currentField.fieldKey]}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">
              {language === 'te' ? 'విభాగాలు ఏవీ లేవు.' : 'No fields found for this service.'}
            </p>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleManualPrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← {language === 'te' ? 'మునుపటిది' : 'Previous'}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors"
            >
              {language === 'te' ? 'టైప్ చేయడానికి ముగించండి' : 'Switch to Typing'}
            </button>
            <button
              type="button"
              onClick={handleManualNext}
              className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition-colors"
            >
              {currentIndex === totalFields - 1
                ? (language === 'te' ? 'ముగించు' : 'Finish')
                : (language === 'te' ? 'దాటవేయి' : 'Skip / Next →')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
