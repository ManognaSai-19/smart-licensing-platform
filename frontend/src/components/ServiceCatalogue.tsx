import React, { useState, useEffect } from 'react';
import { Department, ServiceDetail, ServiceSummary } from '../types/service';
import { fetchDepartments, fetchServices, fetchServiceById } from '../services/serviceCatalogueApi';
import { VoiceAssistantModal } from './VoiceAssistantModal';
import { ApplicationWizard } from './ApplicationWizard';
import {
  Search,
  FileText,
  Clock,
  CreditCard,
  ArrowRight,
  Mic,
  Info,
  Layers,
  Sparkles,
  X,
  Building2,
  Car,
  Briefcase,
} from 'lucide-react';

interface ServiceCatalogueProps {
  onStartApplication?: (serviceId: number) => void;
}

export const ServiceCatalogue: React.FC<ServiceCatalogueProps> = ({ onStartApplication }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Schema Detail Modal
  const [activeServiceDetail, setActiveServiceDetail] = useState<ServiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Application Wizard Trigger
  const [wizardServiceId, setWizardServiceId] = useState<number | null>(null);

  // Voice Assistant Modal
  const [voiceModalService, setVoiceModalService] = useState<{ code: string; name: string } | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadServices();
  }, [selectedDeptId, searchQuery]);

  const loadDepartments = async () => {
    try {
      const data = await fetchDepartments();
      setDepartments(data);
    } catch (err: any) {
      console.error('Error loading departments', err);
    }
  };

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServices(selectedDeptId || undefined, searchQuery);
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (serviceId: number) => {
    setDetailLoading(true);
    try {
      const detail = await fetchServiceById(serviceId);
      setActiveServiceDetail(detail);
    } catch (err: any) {
      alert(`Could not load details: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStartApply = (serviceId: number) => {
    if (onStartApplication) {
      onStartApplication(serviceId);
    } else {
      setWizardServiceId(serviceId);
    }
  };

  const getDepartmentIcon = (deptName?: string) => {
    const lower = (deptName || '').toLowerCase();
    if (lower.includes('transport')) return Car;
    if (lower.includes('municipal') || lower.includes('urban')) return Building2;
    return Briefcase;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#101828] to-[#1E293B] rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/30 text-blue-200 border border-[#2563EB]/40 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            {language === 'en' ? 'Official Citizen Services' : 'అధికారిక పౌర సేవలు'}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {language === 'en' ? 'Explore Government Licences & Permits' : 'ప్రభుత్వ లైసెన్సులు & అనుమతులను శోధించండి'}
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-2 leading-relaxed">
            {language === 'en'
              ? 'Unified portal for end-to-end digital applications with AI-assisted pre-screening, dynamic checklist verification, and real-time SLA tracking.'
              : 'ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ ముందస్తు తనిఖీ మరియు రియల్-టైమ్ ట్రాకింగ్‌తో డిజిటల్ దరఖాస్తులను సమర్పించండి.'}
          </p>
        </div>

        {/* Language Switcher in Header */}
        <div className="mt-4 md:mt-0 md:absolute md:top-8 md:right-8 flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              language === 'en' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('te')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              language === 'te' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            తెలుగు
          </button>
        </div>
      </div>

      {/* SEARCH AND CATEGORY FILTER TABS */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'en'
                ? 'Search services by name, keyword, or license type (e.g. Driving, Trade, Municipal)...'
                : 'సేవల పేరు లేదా లైసెన్స్ రకాన్ని శోధించండి...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition text-[#101828] placeholder-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              &times;
            </button>
          )}
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedDeptId(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedDeptId === null
                ? 'bg-[#101828] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'All Services' : 'అన్ని సేవలు'}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-inherit font-extrabold">
              {services.length}
            </span>
          </button>

          {departments.map((dept) => {
            const Icon = getDepartmentIcon(dept.name);
            const isSelected = selectedDeptId === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDeptId(dept.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{dept.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* SERVICE CARDS GRID */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">
            {language === 'en' ? 'Loading service catalog...' : 'సేవల కేటలాగ్ లోడ్ అవుతోంది...'}
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-[#101828]">No licensing services matched your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All Services".</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptId(null);
            }}
            className="mt-4 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const DeptIcon = getDepartmentIcon(service.departmentName);

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EAF2FF] text-[#2563EB]">
                      <DeptIcon className="w-3 h-3" />
                      <span>{service.departmentName || 'Government Department'}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {service.code}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {service.description || 'Complete your digital application online with verified document review.'}
                  </p>

                  {/* Metadata Chips */}
                  <div className="mt-4 grid grid-cols-2 gap-2 p-3 bg-[#F8FAFC] rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Processing SLA</span>
                        <span className="font-bold text-[#101828]">{service.processingTimeDays} Days</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Govt Fee</span>
                        <span className="font-bold text-[#15803D]">₹{service.sampleFee?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  {/* Primary: Start Application */}
                  <button
                    type="button"
                    onClick={() => handleStartApply(service.id)}
                    className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 group/btn"
                  >
                    <span>{language === 'en' ? 'Start Application' : 'దరఖాస్తు ప్రారంభించండి'}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Secondary 1: Voice Apply */}
                    <button
                      type="button"
                      onClick={() => setVoiceModalService({ code: service.code, name: service.name })}
                      className="py-2 px-3 bg-[#EAF2FF] hover:bg-blue-100 text-[#2563EB] font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{language === 'en' ? 'Voice Apply' : 'వాయిస్ సహాయం'}</span>
                    </button>

                    {/* Secondary 2: View Details & Checklist */}
                    <button
                      type="button"
                      onClick={() => handleViewDetails(service.id)}
                      disabled={detailLoading}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{language === 'en' ? 'Checklist' : 'వివరాలు'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SERVICE SCHEMA & CHECKLIST MODAL */}
      {activeServiceDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  {activeServiceDetail.departmentName} &bull; {activeServiceDetail.code}
                </span>
                <h3 className="text-xl font-black text-[#101828] mt-1">
                  {activeServiceDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveServiceDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Quick Info Bar */}
              <div className="grid grid-cols-4 gap-2 bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Fee</span>
                  <span className="text-sm font-extrabold text-[#15803D]">
                    ₹{activeServiceDetail.sampleFee.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">SLA</span>
                  <span className="text-sm font-extrabold text-[#101828]">
                    {activeServiceDetail.processingTimeDays} Days
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Form Fields</span>
                  <span className="text-sm font-extrabold text-[#2563EB]">
                    {activeServiceDetail.fields.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Documents</span>
                  <span className="text-sm font-extrabold text-[#B45309]">
                    {activeServiceDetail.requiredDocuments.length}
                  </span>
                </div>
              </div>

              {/* Dynamic Fields Checklist */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#101828] flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  <span>Configured Form Fields & Data Inputs</span>
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {activeServiceDetail.fields.map((field) => (
                    <div key={field.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#101828]">{field.labelEn}</span>
                        {field.labelTe && (
                          <span className="text-slate-400 ml-2 font-normal">({field.labelTe})</span>
                        )}
                        <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                          Key: {field.fieldKey}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {field.required ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                            Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                            Optional
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {field.dataType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Section */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#101828] flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                  <span>Mandatory Supporting Documents</span>
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {activeServiceDetail.requiredDocuments.map((doc) => (
                    <div key={doc.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#101828]">{doc.nameEn}</span>
                        {doc.nameTe && (
                          <span className="text-slate-400 ml-2 font-normal">({doc.nameTe})</span>
                        )}
                        <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                          Allowed: PDF, JPG, PNG &bull; Max: {(doc.maxSizeBytes / 1024 / 1024).toFixed(0)} MB
                        </span>
                      </div>
                      {doc.required ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          Mandatory
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                          Optional
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveServiceDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const sId = activeServiceDetail.id;
                  setActiveServiceDetail(null);
                  handleStartApply(sId);
                }}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <span>Proceed to Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guided Application Wizard Screen (Screen 7, 8, 9, 10) */}
      {wizardServiceId && (
        <ApplicationWizard
          initialServiceId={wizardServiceId}
          onClose={() => setWizardServiceId(null)}
          onApplicationCompleted={() => {
            setWizardServiceId(null);
            loadServices();
          }}
        />
      )}

      {/* Voice Assistant Modal */}
      {voiceModalService && (
        <VoiceAssistantModal
          isOpen={!!voiceModalService}
          serviceCode={voiceModalService.code}
          serviceName={voiceModalService.name}
          initialLanguage={language}
          onClose={() => setVoiceModalService(null)}
          onFormUpdate={() => {}}
        />
      )}
    </div>
  );
};
