import React, { useState, useEffect } from 'react';
import { Department, ServiceDetail, ServiceSummary } from '../types/service';
import { fetchDepartments, fetchServices, fetchServiceById } from '../services/serviceCatalogueApi';

export const ServiceCatalogue: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [activeServiceDetail, setActiveServiceDetail] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {language === 'en' ? 'Configurable Service Catalogue' : 'సేవల కేటలాగ్ & దరఖాస్తులు'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'en'
              ? 'Browse government licensing services, dynamic form schemas, and document requirements.'
              : 'ప్రభుత్వ లైసెన్సింగ్ సేవలు, డైనమిక్ ఫారమ్ ఫీల్డ్‌లు మరియు పత్రాల అవసరాలను పరిశీలించండి.'}
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              language === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('te')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              language === 'te' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            తెలుగు (Telugu)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder={language === 'en' ? 'Search licenses by name, code, keyword...' : 'లైసెన్స్ పేరు లేదా కోడ్ ద్వారా శోధించండి...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedDeptId(null)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedDeptId === null
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'en' ? 'All Departments' : 'అన్ని విభాగాలు'}
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => setSelectedDeptId(dept.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedDeptId === dept.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {dept.name} ({dept.serviceCount})
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-3 text-sm text-slate-500">Loading service catalogue...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
          No licensing services matched your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {service.departmentName}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {service.code}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {service.description}
                </p>

                {/* Key Metrics Badges */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-xs text-slate-400">Fee</span>
                    <span className="text-sm font-semibold text-slate-800">
                      ₹{service.sampleFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-xs text-slate-400">Timeline</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {service.processingTimeDays} Days
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-xs text-slate-400">Fields / Docs</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {service.fieldCount} / {service.documentCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleViewDetails(service.id)}
                  disabled={detailLoading}
                  className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <span>{language === 'en' ? 'View Form Schema & Checklist' : 'వివరాలు & పత్రాల జాబితా'}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Schema Detail Modal */}
      {activeServiceDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                  {activeServiceDetail.departmentName} &bull; {activeServiceDetail.code}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {activeServiceDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveServiceDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Service Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                <div>
                  <span className="text-xs text-slate-400 block">Sample Fee</span>
                  <span className="text-base font-bold text-emerald-600">₹{activeServiceDetail.sampleFee.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Processing Time</span>
                  <span className="text-base font-bold text-slate-800">{activeServiceDetail.processingTimeDays} Days</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Configured Fields</span>
                  <span className="text-base font-bold text-indigo-600">{activeServiceDetail.fields.length}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Required Docs</span>
                  <span className="text-base font-bold text-amber-600">{activeServiceDetail.requiredDocuments.length}</span>
                </div>
              </div>

              {/* Dynamic Form Schema Section */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  {language === 'en' ? 'Dynamic Form Fields' : 'డైనమిక్ ఫారమ్ ఫీల్డ్‌లు'}
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {activeServiceDetail.fields.map((field) => (
                    <div key={field.id} className="p-3.5 hover:bg-slate-50 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {language === 'te' && field.labelTe ? field.labelTe : field.labelEn}
                          </span>
                          {field.required && (
                            <span className="text-xs font-semibold text-red-500">* Required</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">
                          Key: {field.fieldKey} {field.optionsJson ? `| Options: ${field.optionsJson}` : ''}
                        </div>
                        {field.validationRules && (
                          <div className="text-xs text-slate-400 mt-0.5 font-mono">
                            Validation: {field.validationRules}
                          </div>
                        )}
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {field.dataType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Section */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {language === 'en' ? 'Required Documents & Pre-Screening Rules' : 'అవసరమైన పత్రాల నిబంధనలు'}
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {activeServiceDetail.requiredDocuments.map((doc) => (
                    <div key={doc.id} className="p-3.5 hover:bg-slate-50 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {language === 'te' && doc.nameTe ? doc.nameTe : doc.nameEn}
                          </span>
                          {doc.required && (
                            <span className="text-xs font-semibold text-red-500">* Mandatory</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Code: <span className="font-mono">{doc.documentCode}</span> &bull; Max Size: {(doc.maxSizeBytes / 1024 / 1024).toFixed(1)} MB
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Allowed Types: <span className="font-mono">{doc.acceptedMimeTypes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveServiceDetail(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
