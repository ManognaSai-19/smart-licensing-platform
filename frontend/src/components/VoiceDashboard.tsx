import React, { useState, useEffect } from 'react';
import { Mic, Volume2, BarChart3, RefreshCw, Sparkles } from 'lucide-react';
import { VoiceAssistantModal } from './VoiceAssistantModal';
import { voiceApi } from '../services/voiceApi';
import { VoiceNormalizationResponse, VoiceStatsResponse } from '../types/voice';
import { isSpeechRecognitionSupported, isSpeechSynthesisSupported, speakPrompt } from '../services/speechService';

export const VoiceDashboard: React.FC = () => {
  const [selectedService, setSelectedService] = useState<'SRV_DRIVING_LICENSE' | 'SRV_TRADE_LICENSE'>('SRV_DRIVING_LICENSE');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<VoiceStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  // Playground state
  const [playgroundText, setPlaygroundText] = useState<string>('15th August 1995');
  const [playgroundDataType, setPlaygroundDataType] = useState<string>('DATE');
  const [playgroundResult, setPlaygroundResult] = useState<VoiceNormalizationResponse | null>(null);
  const [normalizing, setNormalizing] = useState<boolean>(false);

  const sttSupported = isSpeechRecognitionSupported();
  const ttsSupported = isSpeechSynthesisSupported();

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await voiceApi.getStats();
      setStats(data);
    } catch (err) {
      console.warn('Could not load voice stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleTestNormalization = async () => {
    if (!playgroundText.trim()) return;
    setNormalizing(true);
    try {
      const res = await voiceApi.normalize({
        rawTranscript: playgroundText,
        language,
        dataType: playgroundDataType,
      });
      setPlaygroundResult(res);
    } catch (err: any) {
      alert(`Normalization error: ${err.message}`);
    } finally {
      setNormalizing(false);
    }
  };

  const handleTestAudioSample = () => {
    const sample = language === 'te'
      ? 'స్మార్ట్ లైసెన్సింగ్ పోర్టల్ వాయిస్ సహాయకుడికి స్వాగతం.'
      : 'Welcome to the Smart Licensing voice assistant.';
    speakPrompt(sample, { lang: language === 'te' ? 'te-IN' : 'en-IN' });
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100">
            <Mic className="w-3.5 h-3.5 text-indigo-300" />
            <span>Phase 8 Research Prototype &bull; Multilingual Speech Interface</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Voice-First Accessible Application Guidance
          </h2>

          <p className="text-sm md:text-base text-indigo-100 leading-relaxed">
            Progressive enhancement architecture supporting Telugu (<span className="font-semibold">te-IN</span>) and English (<span className="font-semibold">en-IN</span>).
            Enables voice form filling, spoken numbers/dates normalization, audio read-back confirmation, and research telemetry logging without storing raw voice recordings.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-white text-indigo-900 font-bold rounded-xl text-sm hover:bg-indigo-50 shadow-md transition-all flex items-center gap-2 group"
            >
              <Mic className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>Launch Guided Voice Assistant</span>
            </button>

            <button
              type="button"
              onClick={handleTestAudioSample}
              className="px-4 py-2.5 bg-indigo-900/60 hover:bg-indigo-900 text-white font-semibold rounded-xl text-sm border border-indigo-500/30 transition-all flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>{language === 'te' ? 'ఆడియో టెస్ట్ (Telugu TTS)' : 'Test Audio Sample (English TTS)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Browser Capability & Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Capability Diagnostic */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Browser Web Speech Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Speech Recognition (STT):</span>
              <span className={`px-2 py-0.5 rounded font-semibold ${sttSupported ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {sttSupported ? 'Active / Supported' : 'Keyboard Fallback'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Speech Synthesis (TTS):</span>
              <span className={`px-2 py-0.5 rounded font-semibold ${ttsSupported ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {ttsSupported ? 'Active / Supported' : 'Text-Only Mode'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Privacy Architecture:</span>
              <span className="px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700">
                Metadata Only (Zero Audio Storage)
              </span>
            </div>
          </div>
        </div>

        {/* Target Service Selector */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Assistant Target Service
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
              <input
                type="radio"
                name="service"
                checked={selectedService === 'SRV_DRIVING_LICENSE'}
                onChange={() => setSelectedService('SRV_DRIVING_LICENSE')}
                className="text-indigo-600"
              />
              <span className="font-semibold text-slate-800">Learner & Permanent Driving License</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
              <input
                type="radio"
                name="service"
                checked={selectedService === 'SRV_TRADE_LICENSE'}
                onChange={() => setSelectedService('SRV_TRADE_LICENSE')}
                className="text-indigo-600"
              />
              <span className="font-semibold text-slate-800">Municipal Trade & Business License</span>
            </label>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Spoken Language Mode
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-xl border text-center transition-all ${
                language === 'en'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm">English</span>
              <span className="block text-[11px] text-slate-400 font-normal">en-IN (Indian English)</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('te')}
              className={`p-3 rounded-xl border text-center transition-all ${
                language === 'te'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm">తెలుగు</span>
              <span className="block text-[11px] text-slate-400 font-normal">te-IN (Telugu)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spoken Normalization Engine Playground */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Spoken Normalization & Intent Engine Playground</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Test how spoken words, Telugu numerals, dates, and blood groups are normalized into database values.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Quick Samples:</span>
            <button
              type="button"
              onClick={() => { setPlaygroundText('15th August 1995'); setPlaygroundDataType('DATE'); }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
            >
              15th August 1995
            </button>
            <button
              type="button"
              onClick={() => { setPlaygroundText('౫౦౦౦౦'); setPlaygroundDataType('NUMBER'); }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
            >
              ౫౦౦౦౦ (Telugu Digits)
            </button>
            <button
              type="button"
              onClick={() => { setPlaygroundText('ఒకటి రెండు మూడు నాలుగు ఐదు ఆరు ఏడు ఎనిమిది తొమ్మిది సున్నా ఒకటి రెండు'); setPlaygroundDataType('NUMBER'); }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
            >
              Telugu Spoken Words
            </button>
            <button
              type="button"
              onClick={() => { setPlaygroundText('అవును'); setPlaygroundDataType('TEXT'); }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
            >
              అవును (Yes)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Spoken Transcript Input
            </label>
            <input
              type="text"
              value={playgroundText}
              onChange={(e) => setPlaygroundText(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter spoken text or words..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Field Type
            </label>
            <select
              value={playgroundDataType}
              onChange={(e) => setPlaygroundDataType(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="TEXT">TEXT (Standard)</option>
              <option value="NUMBER">NUMBER (Digits / Aadhaar / Turnover)</option>
              <option value="DATE">DATE (Date of Birth / Issue Date)</option>
              <option value="SELECT">SELECT (Blood Group / Vehicle Class)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleTestNormalization}
              disabled={normalizing}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow transition-colors"
            >
              {normalizing ? 'Normalizing...' : 'Normalize Input →'}
            </button>
          </div>
        </div>

        {/* Normalization Result Display */}
        {playgroundResult && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Raw Spoken Input</span>
              <span className="font-semibold text-slate-800 break-words">{playgroundResult.rawTranscript}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Normalized Value</span>
              <span className="font-bold text-emerald-700 text-sm">{playgroundResult.normalizedValue}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Detected Intent</span>
              <span className="font-mono font-bold text-indigo-700">{playgroundResult.detectedIntent}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Audio Read-Back Response</span>
              <span className="font-medium text-slate-700 italic">"{playgroundResult.readbackText}"</span>
            </div>
          </div>
        )}
      </div>

      {/* Research Telemetry & Usability Evaluation Metrics */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Voice Interaction Research Telemetry (Academic Baseline Metrics)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live statistics queried from <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">/api/voice/telemetry/stats</code> for research paper evaluation.
            </p>
          </div>
          <button
            type="button"
            onClick={loadStats}
            disabled={statsLoading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
              <span className="text-xs text-indigo-600 font-semibold block uppercase">Total Interactions</span>
              <span className="text-2xl font-bold text-indigo-900 mt-1 block">{stats.totalInteractions}</span>
              <span className="text-[11px] text-indigo-600 mt-0.5 block">Logged sessions</span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
              <span className="text-xs text-emerald-600 font-semibold block uppercase">Confirmation Rate</span>
              <span className="text-2xl font-bold text-emerald-900 mt-1 block">{stats.confirmationRate}%</span>
              <span className="text-[11px] text-emerald-600 mt-0.5 block">{stats.confirmedInteractions} confirmed</span>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-center">
              <span className="text-xs text-purple-600 font-semibold block uppercase">Average Confidence</span>
              <span className="text-2xl font-bold text-purple-900 mt-1 block">
                {stats.averageConfidence ? `${(stats.averageConfidence * 100).toFixed(1)}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-purple-600 mt-0.5 block">Speech recognition accuracy</span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
              <span className="text-xs text-amber-600 font-semibold block uppercase">Avg Corrections</span>
              <span className="text-2xl font-bold text-amber-900 mt-1 block">
                {stats.averageCorrectionCount !== null ? stats.averageCorrectionCount.toFixed(2) : '0.00'}
              </span>
              <span className="text-[11px] text-amber-600 mt-0.5 block">Corrections per field</span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-400">
            {statsLoading ? 'Loading research telemetry...' : 'No telemetry recorded yet.'}
          </div>
        )}

        {/* Breakdown Tags */}
        {stats && (
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Languages Logged:</span>
              {Object.entries(stats.languageBreakdown).map(([langKey, count]) => (
                <span key={langKey} className="px-2 py-0.5 bg-slate-100 rounded-md font-mono">
                  {langKey}: {count}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Input Modes:</span>
              {Object.entries(stats.inputModeBreakdown).map(([modeKey, count]) => (
                <span key={modeKey} className="px-2 py-0.5 bg-slate-100 rounded-md font-mono">
                  {modeKey}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guided Voice Assistant Modal */}
      {isModalOpen && (
        <VoiceAssistantModal
          isOpen={isModalOpen}
          serviceCode={selectedService}
          serviceName={selectedService === 'SRV_DRIVING_LICENSE' ? 'Learner & Permanent Driving License' : 'Municipal Trade & Business License'}
          initialLanguage={language}
          onClose={() => {
            setIsModalOpen(false);
            loadStats();
          }}
          onFormUpdate={(data) => {
            console.log('Voice form updated:', data);
          }}
        />
      )}
    </div>
  );
};
