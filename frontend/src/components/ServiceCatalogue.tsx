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
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-8 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-[#101828] via-[#162544] to-[#1E3A8A] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#2563EB]/40 text-[#EAF2FF] border border-[#2563EB]/50">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Official Government Catalogue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {language === 'en' ? 'Explore Government Licenses & Permits' : 'ప్రభుత్వ లైసెన్సులు & అనుమతులను శోధించండి'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {language === 'en'
              ? 'Unified portal for end-to-end digital applications with AI-assisted pre-screening, dynamic checklist verification, and real-time SLA tracking.'
              : 'ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ ముందస్తు తనిఖీ మరియు రియల్-టైమ్ ట్రాకింగ్‌తో డిజిటల్ దరఖాస్తులను సమర్పించండి.'}
          </p>
        </div>
      </div>

      {/* SEARCH AND DEPARTMENT FILTER BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search by service name, code, or department...' : 'పేరు లేదా కోడ్ ద్వారా శోధించండి...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
            />
          </div>

          {/* Bilingual Switcher inside Catalogue */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg transition ${
                language === 'en' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('te')}
              className={`px-3 py-1.5 rounded-lg transition ${
                language === 'te' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedDeptId(null)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap ${
              selectedDeptId === null
                ? 'bg-[#101828] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-[#64748B]'
            }`}
          >
            All Services ({services.length})
          </button>
          {departments.map((dept) => {
            const Icon = getDepartmentIcon(dept.name);
            const isSelected = selectedDeptId === dept.id;

            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDeptId(dept.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#64748B]'
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
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#B91C1C] text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-[#B91C1C]" />
          <span>{error}</span>
        </div>
      )}

      {/* SERVICE CARDS GRID */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">
            {language === 'en' ? 'Loading service catalog...' : 'సేవల కేటలాగ్ లోడ్ అవుతోంది...'}
          </p>
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-[#101828]">No licensing services matched your criteria.</p>
          <p className="text-xs text-[#64748B]">Try clearing your search query or selecting "All Services".</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptId(null);
            }}
            className="mt-2 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition"
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
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EAF2FF] text-[#2563EB]">
                      <DeptIcon className="w-3.5 h-3.5" />
                      <span>{service.departmentName || 'Government Department'}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {service.code}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-extrabold text-[#101828] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                    {service.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                    {service.description || 'Complete your digital application online with verified document review.'}
                  </p>

                  {/* Metadata Chips */}
                  <div className="mt-4 grid grid-cols-2 gap-2 p-3 bg-[#F8FAFC] rounded-2xl border border-slate-100 text-xs">
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
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
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
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold rounded-xl text-xs transition flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{language === 'en' ? 'Requirements' : 'వివరాలు'}</span>
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
                  <span className="text-[10px] text-slate-400 font-semibold block">Govt Fee</span>
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

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveServiceDetail(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = activeServiceDetail.id;
                  setActiveServiceDetail(null);
                  handleStartApply(id);
                }}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Proceed to Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guided Application Wizard Dialog */}
      {wizardServiceId && (
        <ApplicationWizard
          initialServiceId={wizardServiceId}
          onClose={() => setWizardServiceId(null)}
          onApplicationCompleted={() => setWizardServiceId(null)}
        />
      )}

      {/* Voice Assistant Modal */}
      {voiceModalService && (
        <VoiceAssistantModal
          isOpen={true}
          serviceCode={voiceModalService.code}
          serviceName={voiceModalService.name}
          onClose={() => setVoiceModalService(null)}
          onFormUpdate={() => {}}
        />
      )}
    </div>
  );
};
