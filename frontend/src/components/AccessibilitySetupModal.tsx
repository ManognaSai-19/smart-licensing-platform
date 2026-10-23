import React, { useState, useEffect } from 'react';
import { Volume2, FileText, Check, Globe, Eye, X } from 'lucide-react';

interface AccessibilitySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (prefs: AccessibilityPreferences) => void;
}

export interface AccessibilityPreferences {
  language: 'en' | 'te';
  interactionMode: 'voice_and_text' | 'text_only';
  readAloud: boolean;
  largeText: boolean;
}

export const defaultPreferences: AccessibilityPreferences = {
  language: 'en',
  interactionMode: 'voice_and_text',
  readAloud: true,
  largeText: false,
};

export const AccessibilitySetupModal: React.FC<AccessibilitySetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    try {
      const saved = localStorage.getItem('smart_licensing_accessibility');
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  useEffect(() => {
    if (preferences.largeText) {
      document.documentElement.classList.add('text-lg-mode');
    } else {
      document.documentElement.classList.remove('text-lg-mode');
    }
  }, [preferences.largeText]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('smart_licensing_accessibility', JSON.stringify(preferences));
    if (onSave) onSave(preferences);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#101828] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-sm">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="accessibility-title" className="text-base font-bold">
                Language & Accessibility Setup
              </h2>
              <p className="text-xs text-slate-300">Choose how you would like to use the platform</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-[#F8FAFC]">
          {/* Section 1: Preferred Language */}
          <div>
            <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">
              Preferred Language
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreferences((p) => ({ ...p, language: 'en' }))}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                  preferences.language === 'en'
                    ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/20 text-[#2563EB] shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">English</span>
                  <span className="text-[10px] text-slate-400">Default portal language</span>
                </div>
                {preferences.language === 'en' && <Check className="w-4 h-4 text-[#2563EB]" />}
              </button>

              <button
                type="button"
                onClick={() => setPreferences((p) => ({ ...p, language: 'te' }))}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                  preferences.language === 'te'
                    ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/20 text-[#2563EB] shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">Telugu (తెలుగు)</span>
                  <span className="text-[10px] text-slate-400">ప్రాంతీయ భాషా మద్దతు</span>
                </div>
                {preferences.language === 'te' && <Check className="w-4 h-4 text-[#2563EB]" />}
              </button>
            </div>
          </div>

          {/* Section 2: Interaction Mode */}
          <div>
            <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">
              Interaction Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreferences((p) => ({ ...p, interactionMode: 'voice_and_text' }))}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                  preferences.interactionMode === 'voice_and_text'
                    ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#101828] block">Voice and text</span>
                  <span className="text-[10px] text-slate-500">Spoken assistance and text entry</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreferences((p) => ({ ...p, interactionMode: 'text_only' }))}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                  preferences.interactionMode === 'text_only'
                    ? 'bg-white border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#101828] block">Text only</span>
                  <span className="text-[10px] text-slate-500">Standard form typing</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Additional Accessibility Toggles */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.readAloud}
                onChange={(e) => setPreferences((p) => ({ ...p, readAloud: e.target.checked }))}
                className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
              <span className="text-xs font-semibold text-[#101828]">
                Read instructions aloud when supported
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.largeText}
                onChange={(e) => setPreferences((p) => ({ ...p, largeText: e.target.checked }))}
                className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
              <span className="text-xs font-semibold text-[#101828] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Show larger text for better readability</span>
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
