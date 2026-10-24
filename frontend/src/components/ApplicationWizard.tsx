import React, { useState, useEffect } from 'react';
import { ServiceDetail, ServiceSummary } from '../types/service';
import { ApplicationDetail } from '../types/application';
import { fetchServices, fetchServiceById } from '../services/serviceCatalogueApi';
import { applicationApi } from '../services/applicationApi';
import { DocumentUploadSection } from './DocumentUploadSection';
import { PrescreeningFindingsView } from './PrescreeningFindingsView';
import { VoiceInputButton } from './VoiceInputButton';
import { VoiceAssistantModal } from './VoiceAssistantModal';
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Sparkles,
  AlertCircle,
  X,
  Mic,
} from 'lucide-react';

interface ApplicationWizardProps {
  initialServiceId?: number;
  existingApplication?: ApplicationDetail | null;
  onClose: () => void;
  onApplicationCompleted?: (app: ApplicationDetail) => void;
}

export const ApplicationWizard: React.FC<ApplicationWizardProps> = ({
  initialServiceId,
  existingApplication,
  onClose,
  onApplicationCompleted,
}) => {
  const [step, setStep] = useState<number>(existingApplication ? 2 : 1);
  const [language, setLanguage] = useState<'en' | 'te'>('en');

  // Services State
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    existingApplication?.serviceId || initialServiceId || null
  );
  const [serviceDetail, setServiceDetail] = useState<ServiceDetail | null>(null);

  // Application Draft State
  const [application, setApplication] = useState<ApplicationDetail | null>(existingApplication || null);
  const [formData, setFormData] = useState<Record<string, any>>(existingApplication?.formData || {});

  // UI / Status State
  const [loading, setLoading] = useState<boolean>(false);
  const [savingDraft, setSavingDraft] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successApp, setSuccessApp] = useState<ApplicationDetail | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);

  // Voice Assistant Modal
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);

  // Mandatory fields validation for Step 2
  const mandatoryFields = serviceDetail?.fields.filter((f) => f.required) || [];
  const unfilledMandatoryFields = mandatoryFields.filter((f) => {
    const val = formData[f.fieldKey];
    if (val === undefined || val === null) return true;
    if (typeof val === 'string') return val.trim().length === 0;
    if (typeof val === 'number') return isNaN(val);
    return false;
  });
  const isStep2Valid = unfilledMandatoryFields.length === 0;

  useEffect(() => {
    fetchServices().then(setServices).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialServiceId && !existingApplication && !application) {
      handleStartApplication(initialServiceId);
    }
  }, [initialServiceId]);

  useEffect(() => {
    if (selectedServiceId) {
      setLoading(true);
      fetchServiceById(selectedServiceId)
        .then((detail) => {
          setServiceDetail(detail);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [selectedServiceId]);

  // Handle starting a new draft
  const handleStartApplication = async (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setError(null);
    setLoading(true);

    try {
      const draft = await applicationApi.createDraft({
        serviceId,
        languagePreference: language,
      });
      setApplication(draft);
      setFormData(draft.formData || {});
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize draft application');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual saving of draft
  const handleSaveDraft = async () => {
    if (!application) return;
    setSavingDraft(true);
    setError(null);

    try {
      const updated = await applicationApi.updateDraft(application.id, {
        formData,
        languagePreference: language,
      });
      setApplication(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to save draft progress');
    } finally {
      setSavingDraft(false);
    }
  };

  // Handle field change
  const handleFieldChange = (fieldKey: string, val: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: val,
    }));
  };

  // Final Submission
  const handleSubmitApplication = async () => {
    if (!application) return;
    if (!declarationAccepted) {
      setError('Please accept the declaration before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // First save draft form data
      await applicationApi.updateDraft(application.id, {
        formData,
        languagePreference: language,
      });

      // Submit
      let submitted: ApplicationDetail;
      if (application.status === 'REJECTED') {
        submitted = await applicationApi.resubmitApplication(application.id);
      } else {
        submitted = await applicationApi.submitApplication(application.id);
      }

      setSuccessApp(submitted);
      if (onApplicationCompleted) onApplicationCompleted(submitted);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check form validation and required documents.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Select Service' },
    { num: 2, title: 'Application Form' },
    { num: 3, title: 'Upload Documents' },
    { num: 4, title: 'Pre-Screening' },
    { num: 5, title: 'Review & Submit' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div className="bg-white sm:rounded-3xl shadow-2xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Wizard Header */}
        <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="wizard-title" className="text-sm sm:text-base font-extrabold tracking-tight">
                  {existingApplication ? 'Continue Application' : 'New Digital Application'}
                </h2>
                {application?.referenceNumber && (
                  <span className="text-[11px] font-mono bg-[#EAF2FF] text-[#2563EB] px-2 py-0.5 rounded-full font-bold">
                    {application.referenceNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {serviceDetail?.name || 'Guided Step-by-Step Licensing Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="bg-white/10 rounded-xl p-1 flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  language === 'en' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  language === 'te' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close application wizard"
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-3.5 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[540px]">
            {steps.map((s, idx) => {
              const isCurrent = step === s.num;
              const isPast = step > s.num;
              return (
                <div key={s.num} className="flex items-center">
                  <div
                    onClick={() => {
                      if (application && s.num <= step) setStep(s.num);
                    }}
                    className={`flex items-center gap-2 cursor-pointer ${
                      isCurrent
                        ? 'text-[#2563EB] font-bold'
                        : isPast
                        ? 'text-[#15803D] font-medium'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : isPast
                          ? 'bg-[#15803D] text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPast ? '✓' : s.num}
                    </span>
                    <span className="text-xs whitespace-nowrap">{s.title}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-8 md:w-16 h-0.5 bg-slate-200 mx-2"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[#B91C1C] text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-[#101828]">
                  Select a Government Licensing Service
                </h3>
                <p className="text-xs text-[#64748B]">
                  Choose the license or permit you wish to apply for to generate your application schema.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-5 border border-slate-200 hover:border-[#2563EB] rounded-2xl bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#EAF2FF] text-[#2563EB]">
                        {svc.departmentName}
                      </span>
                      <h4 className="text-sm font-extrabold text-[#101828] mt-2 group-hover:text-[#2563EB] transition-colors">
                        {svc.name}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                        {svc.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-400 block font-semibold text-[10px]">Fee & SLA:</span>
                        <span className="font-bold text-[#101828]">₹{svc.sampleFee.toFixed(2)} &bull; {svc.processingTimeDays} Days</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartApplication(svc.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC FORM FIELDS WITH VOICE (DESKTOP SPLIT PANEL, MOBILE STACKED) */}
          {step === 2 && serviceDetail && (
            <div className="space-y-6">
              {/* Desktop Split-Screen Grid (8 cols form / 4 cols Voice Panel) */}
              <div className="lg:grid lg:grid-cols-12 lg:gap-6 space-y-6 lg:space-y-0">
                {/* Form Fields Column */}
                <div className="lg:col-span-8 space-y-5">
                  {/* Mandatory Fields Progress Banner */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isStep2Valid
                        ? 'bg-emerald-50/70 border-emerald-200 text-[#15803D]'
                        : 'bg-[#EAF2FF] border-[#cfe0fc] text-[#101828]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                            isStep2Valid
                              ? 'bg-[#15803D] text-white shadow-sm'
                              : 'bg-[#2563EB] text-white shadow-sm'
                          }`}
                        >
                          {isStep2Valid ? '✓' : '!'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold flex items-center gap-1.5">
                            <span>
                              {isStep2Valid
                                ? 'All Mandatory Fields Completed'
                                : 'Mandatory Fields Check'}
                            </span>
                            {isStep2Valid && (
                              <span className="text-[10px] bg-[#15803D] text-white px-2 py-0.5 rounded-full font-bold">
                                Ready for Next Step
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            {isStep2Valid
                              ? 'All required fields are filled. You can now click "Next" below.'
                              : `Please fill in all mandatory fields marked with an asterisk (*) to enable the "Next" button (${unfilledMandatoryFields.length} remaining).`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            isStep2Valid
                              ? 'bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/30'
                              : 'bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/30'
                          }`}
                        >
                          {mandatoryFields.length - unfilledMandatoryFields.length} / {mandatoryFields.length} Mandatory Filled
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Application Data Inputs ({serviceDetail.fields.length})
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Tap mic next to any field to speak
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {serviceDetail.fields.map((field) => {
                        const label = language === 'te' && field.labelTe ? field.labelTe : field.labelEn;
                        const val = formData[field.fieldKey] || '';
                        const isFilled = typeof val === 'string' ? val.trim().length > 0 : val !== undefined && val !== null;

                        return (
                          <div
                            key={field.id}
                            className={`p-4 rounded-2xl border transition-all space-y-2 ${
                              field.required && !isFilled
                                ? 'bg-amber-50/30 border-amber-200'
                                : 'bg-[#F8FAFC] border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={field.fieldKey}
                                className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5"
                              >
                                <span>{label}</span>
                                {field.required ? (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                      isFilled
                                        ? 'bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20'
                                        : 'bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/30'
                                    }`}
                                  >
                                    {isFilled ? '✓ Filled' : '* Mandatory'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    (Optional)
                                  </span>
                                )}
                              </label>

                              {/* Inline Voice Input Button */}
                              <VoiceInputButton
                                fieldKey={field.fieldKey}
                                label={label}
                                dataType={field.dataType}
                                language={language}
                                serviceCode={serviceDetail.code}
                                applicationId={application?.id}
                                currentValue={val}
                                onValueConfirmed={(k, v) => handleFieldChange(k, v)}
                              />
                            </div>

                            {field.dataType === 'SELECT' ? (
                              <select
                                id={field.fieldKey}
                                name={field.fieldKey}
                                value={val}
                                onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                                className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition ${
                                  field.required && !isFilled ? 'border-amber-300' : 'border-slate-300'
                                }`}
                              >
                                <option value="">-- Select Option --</option>
                                {field.optionsJson &&
                                  JSON.parse(field.optionsJson).map((opt: string) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                              </select>
                            ) : field.dataType === 'DATE' ? (
                              <input
                                type="date"
                                id={field.fieldKey}
                                name={field.fieldKey}
                                value={val}
                                onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                                className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition ${
                                  field.required && !isFilled ? 'border-amber-300' : 'border-slate-300'
                                }`}
                              />
                            ) : field.dataType === 'NUMBER' ? (
                              <input
                                type="number"
                                id={field.fieldKey}
                                name={field.fieldKey}
                                value={val}
                                onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                                className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition ${
                                  field.required && !isFilled ? 'border-amber-300' : 'border-slate-300'
                                }`}
                                placeholder="Enter number..."
                              />
                            ) : (
                              <input
                                type="text"
                                id={field.fieldKey}
                                name={field.fieldKey}
                                value={val}
                                onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                                className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition ${
                                  field.required && !isFilled ? 'border-amber-300' : 'border-slate-300'
                                }`}
                                placeholder={`Enter ${label}...`}
                              />
                            )}

                            {field.validationRules && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                Rule: {field.validationRules}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* VOICE ASSISTANT SIDE PANEL (Desktop Sticky, Mobile Stacked) */}
                <div className="lg:col-span-4">
                  <div className="bg-gradient-to-br from-[#101828] via-[#162544] to-[#2563EB] text-white p-6 rounded-3xl shadow-lg border border-slate-700/50 space-y-4 lg:sticky lg:top-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
                      <Mic className="w-7 h-7 text-[#EAF2FF]" />
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-white">
                        Voice Form Assistant
                      </h4>
                      <p className="text-xs text-[#EAF2FF]/80 mt-0.5">
                        Telugu & English Speech Guidance
                      </p>
                    </div>

                    <p className="text-xs text-[#EAF2FF]/90 leading-relaxed">
                      Don't want to type? Speak aloud. The voice assistant prompts you question by question and auto-fills every field.
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsVoiceAssistantOpen(true)}
                      className="w-full py-3 px-4 bg-white text-[#2563EB] hover:bg-[#EAF2FF] font-black rounded-2xl text-xs shadow-sm transition flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-[#2563EB]" />
                      <span>Launch Voice Dialog</span>
                    </button>

                    <div className="pt-3 border-t border-white/10 space-y-2 text-left text-[11px] text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Dictate field-by-field or full dialogue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Instant audio read-back confirmation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENT UPLOAD */}
          {step === 3 && application && (
            <div className="space-y-4">
              <DocumentUploadSection
                applicationId={application.id}
                language={language}
                onUploadSuccess={() => {}}
              />
            </div>
          )}

          {/* STEP 4: PRE-SCREENING FINDINGS */}
          {step === 4 && application && (
            <div className="space-y-4">
              <PrescreeningFindingsView
                applicationId={application.id}
                language={language}
              />
            </div>
          )}

          {/* STEP 5: REVIEW & FINAL SUBMISSION */}
          {step === 5 && serviceDetail && application && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-[#101828]">
                  Final Application Review & Declarations
                </h3>
                <p className="text-xs text-[#64748B]">
                  Please verify your details and supporting documents before submitting for official adjudication.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Service</span>
                    <span className="text-sm font-extrabold text-[#101828]">{serviceDetail.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Fee & SLA</span>
                    <span className="text-sm font-extrabold text-[#15803D]">
                      ₹{serviceDetail.sampleFee.toFixed(2)} &bull; {serviceDetail.processingTimeDays} Days
                    </span>
                  </div>
                </div>

                {/* Form fields summary */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Entered Form Data ({Object.keys(formData).length} fields)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {Object.entries(formData).map(([k, v]) => (
                      <div key={k} className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">{k}</span>
                        <span className="text-[#0F172A] font-bold break-words mt-0.5 block">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Citizen Legal Declaration */}
              <div className="p-4 bg-[#EAF2FF] border border-[#cfe0fc] rounded-2xl space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="w-4 h-4 text-[#2563EB] mt-0.5 rounded focus:ring-[#2563EB]"
                  />
                  <span className="text-xs text-[#101828] font-medium leading-relaxed">
                    I solemnly declare that the information and documents provided in this application are genuine, correct, and complete to the best of my knowledge. I understand that false statements or forged documentation may lead to legal penalties and permanent revocation.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* SUCCESS MODAL ON SUBMIT */}
          {successApp && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#101828]">Application Submitted!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your application has been routed to the departmental verification queue for review by authorized officers.
                  </p>
                </div>

                <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Reference Number</span>
                  <p className="text-lg font-mono font-black text-[#2563EB]">
                    {successApp.referenceNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 2 && !isStep2Valid && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-[#B45309] bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Fill mandatory fields (*) to proceed</span>
              </span>
            )}

            {step === 2 && application && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="px-4 py-2 border border-[#cfe0fc] bg-[#EAF2FF] text-[#2563EB] hover:bg-[#dbe9fe] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingDraft ? 'Saving...' : 'Save Draft'}</span>
              </button>
            )}

            {step < 5 ? (
              step > 1 && (
                <button
                  type="button"
                  disabled={step === 2 && !isStep2Valid}
                  onClick={async () => {
                    if (step === 2) {
                      if (!isStep2Valid) {
                        setError(
                          `Please fill in all mandatory fields before clicking Next: ${unfilledMandatoryFields
                            .map((f) => f.labelEn)
                            .join(', ')}`
                        );
                        return;
                      }
                      if (application) {
                        await handleSaveDraft();
                      }
                    }
                    setError(null);
                    setStep((prev) => Math.min(prev + 1, 5));
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 ${
                    step === 2 && !isStep2Valid
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white active:scale-98'
                  }`}
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="px-6 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Voice Assistant Step-by-Step Modal */}
      {isVoiceAssistantOpen && serviceDetail && (
        <VoiceAssistantModal
          isOpen={isVoiceAssistantOpen}
          serviceCode={serviceDetail.code}
          serviceName={serviceDetail.name}
          initialLanguage={language}
          applicationId={application?.id}
          initialFormData={formData}
          onClose={() => setIsVoiceAssistantOpen(false)}
          onFormUpdate={(updated) => {
            setFormData((prev) => ({ ...prev, ...updated }));
          }}
        />
      )}
    </div>
  );
};
