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
  onApplicationCompleted: (app: ApplicationDetail) => void;
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

  useEffect(() => {
    fetchServices().then(setServices).catch(console.error);
  }, []);

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
        initialFormData: {},
      });
      setApplication(draft);
      setFormData(draft.formData || {});
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize application draft');
    } finally {
      setLoading(false);
    }
  };

  // Handle saving draft
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
      setError(err.message || 'Could not save draft');
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
      onApplicationCompleted(submitted);
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Wizard Header */}
        <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shadow">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="wizard-title" className="text-base font-bold">
                  {existingApplication ? 'Continue Application' : 'New Digital Application'}
                </h2>
                {application?.referenceNumber && (
                  <span className="text-xs font-mono bg-[#EAF2FF] text-[#2563EB] px-2 py-0.5 rounded font-bold">
                    {application.referenceNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {serviceDetail?.name || 'Guided Step-by-Step Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="bg-slate-800 rounded-lg p-1 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  language === 'en' ? 'bg-[#2563EB] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  language === 'te' ? 'bg-[#2563EB] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-3 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px]">
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
                          ? 'bg-[#2563EB] text-white shadow-sm'
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Select a Government Licensing Service
                </h3>
                <p className="text-xs text-slate-500">
                  Choose the license or permit you wish to apply for to begin form schema configuration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-5 border border-slate-200 hover:border-indigo-500 rounded-2xl bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {svc.departmentName}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-2">
                        {svc.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {svc.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-400 block">Fee & SLA:</span>
                        <span className="font-bold text-slate-800">₹{svc.sampleFee.toFixed(2)} &bull; {svc.processingTimeDays} Days</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartApplication(svc.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow transition-colors flex items-center gap-1.5"
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

          {/* STEP 2: DYNAMIC FORM FIELDS WITH VOICE */}
          {step === 2 && serviceDetail && (
            <div className="space-y-6">
              {/* Hands-Free Voice Assistant CTA Banner */}
              <div className="bg-gradient-to-r from-[#101828] via-[#162544] to-[#2563EB] text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <span>Hands-Free Voice Guidance Available</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                        Telugu & English
                      </span>
                    </h4>
                    <p className="text-xs text-[#EAF2FF] mt-0.5">
                      You can fill the entire form through step-by-step spoken voice prompts with automatic read-back verification.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVoiceAssistantOpen(true)}
                  className="px-4 py-2 bg-white text-[#2563EB] hover:bg-[#EAF2FF] font-bold rounded-xl text-xs shadow transition-all whitespace-nowrap flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Launch Voice Assistant</span>
                </button>
              </div>

              {/* Form Fields Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Form Fields ({serviceDetail.fields.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceDetail.fields.map((field) => {
                    const label = language === 'te' && field.labelTe ? field.labelTe : field.labelEn;
                    const val = formData[field.fieldKey] || '';

                    return (
                      <div
                        key={field.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={field.fieldKey}
                            className="text-xs font-bold text-slate-800 flex items-center gap-1"
                          >
                            <span>{label}</span>
                            {field.required && <span className="text-red-500">*</span>}
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
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        ) : field.dataType === 'NUMBER' ? (
                          <input
                            type="number"
                            id={field.fieldKey}
                            name={field.fieldKey}
                            value={val}
                            onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="Enter number..."
                          />
                        ) : (
                          <input
                            type="text"
                            id={field.fieldKey}
                            name={field.fieldKey}
                            value={val}
                            onChange={(e) => handleFieldChange(field.fieldKey, e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder={`Enter ${label}...`}
                          />
                        )}

                        {field.validationRules && (
                          <p className="text-[11px] text-slate-400 font-mono">
                            Rule: {field.validationRules}
                          </p>
                        )}
                      </div>
                    );
                  })}
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
                onUploadSuccess={() => {
                  console.log('Document uploaded successfully');
                }}
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
                <h3 className="text-lg font-bold text-slate-900">
                  Final Application Review & Declarations
                </h3>
                <p className="text-xs text-slate-500">
                  Please verify your details and supporting documents before submitting for official adjudication.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 block">Service</span>
                    <span className="text-sm font-bold text-slate-900">{serviceDetail.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Fee / SLA</span>
                    <span className="text-sm font-bold text-emerald-600">₹{serviceDetail.sampleFee.toFixed(2)} &bull; {serviceDetail.processingTimeDays} Days</span>
                  </div>
                </div>

                {/* Form fields summary */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Entered Form Data
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {Object.entries(formData).map(([k, v]) => (
                      <div key={k} className="p-2.5 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-400 block font-semibold">{k}</span>
                        <span className="text-slate-800 font-bold break-words">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Citizen Legal Declaration */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 mt-0.5 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs text-indigo-950 font-medium leading-relaxed">
                    I solemnly declare that the information and documents provided in this application are genuine, correct, and complete to the best of my knowledge. I understand that false statements or forged documentation may lead to legal penalties and permanent revocation.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* SUCCESS MODAL ON SUBMIT */}
          {successApp && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your application has been routed to the departmental verification queue for review by authorized officers.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Reference Number</span>
                  <p className="text-lg font-mono font-bold text-indigo-700">
                    {successApp.referenceNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 2 && application && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="px-4 py-2 border border-[#cfe0fc] bg-[#EAF2FF] text-[#2563EB] hover:bg-[#dbe9fe] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingDraft ? 'Saving...' : 'Save Draft'}</span>
              </button>
            )}

            {step < 5 ? (
              step > 1 && (
                <button
                  type="button"
                  onClick={async () => {
                    if (step === 2 && application) {
                      await handleSaveDraft();
                    }
                    setStep((prev) => Math.min(prev + 1, 5));
                  }}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl text-xs shadow transition-colors flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="px-6 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
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
