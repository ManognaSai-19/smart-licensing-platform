import React, { useState, useEffect, useRef } from 'react';
import { DocumentChecklistStatus } from '../types/document';
import { documentApi } from '../services/documentApi';
import {
  UploadCloud,
  CheckCircle2,
  Trash2,
  ExternalLink,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Info,
} from 'lucide-react';

interface DocumentUploadSectionProps {
  applicationId: number;
  language: 'en' | 'te';
  canEdit?: boolean;
  onUploadSuccess?: () => void;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  applicationId,
  language,
  canEdit = true,
  onUploadSuccess,
}) => {
  const [checklist, setChecklist] = useState<DocumentChecklistStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingTypeId, setUploadingTypeId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await documentApi.getChecklist(applicationId);
      setChecklist(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load document checklist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchChecklist();
    }
  }, [applicationId]);

  const handleFileChange = async (typeId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTypeId(typeId);
      setErrorMsg(null);
      setSuccessMsg(null);

      await documentApi.uploadDocument(applicationId, typeId, file);
      setSuccessMsg(
        language === 'te' ? 'పత్రం విజయవంతంగా అప్‌లోడ్ చేయబడింది' : 'Document uploaded successfully'
      );
      await fetchChecklist();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed. Please ensure file meets format criteria.');
    } finally {
      setUploadingTypeId(null);
      if (fileInputRefs.current[typeId]) {
        fileInputRefs.current[typeId]!.value = '';
      }
    }
  };

  const handleDelete = async (docId: number) => {
    if (
      !window.confirm(
        language === 'te' ? 'ఈ పత్రాన్ని తొలగించాలనుకుంటున్నారా?' : 'Delete this document?'
      )
    ) {
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      await documentApi.deleteDocument(applicationId, docId);
      setSuccessMsg(language === 'te' ? 'పత్రం తొలగించబడింది' : 'Document removed successfully');
      await fetchChecklist();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete failed');
    }
  };

  const mandatoryCount = checklist.filter((item) => item.required).length;
  const mandatoryUploadedCount = checklist.filter((item) => item.required && item.uploaded).length;
  const isComplete = mandatoryCount > 0 && mandatoryUploadedCount === mandatoryCount;
  const progressPercent = mandatoryCount > 0 ? Math.round((mandatoryUploadedCount / mandatoryCount) * 100) : 0;

  if (loading) {
    return (
      <div className="p-10 text-center bg-white rounded-3xl border border-slate-200">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium text-slate-500">
          {language === 'te' ? 'పత్రాల జాబితా లోడ్ అవుతోంది...' : 'Loading document requirements...'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 animate-in fade-in">
      {/* HEADER WITH PROGRESS TRACKER */}
      <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#101828] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#2563EB]" />
              <span>{language === 'te' ? 'సహాయక పత్రాల అప్‌లోడ్' : 'Required Supporting Documents'}</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              {language === 'te'
                ? 'ధృవీకరణ మరియు ఆటోమేటెడ్ OCR కోసం పత్రాలను అప్‌లోడ్ చేయండి'
                : 'Upload authentic proofs for AI pre-screening and officer adjudication'}
            </p>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 ${
              isComplete
                ? 'bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/30'
                : 'bg-amber-50 text-[#B45309] border border-amber-200'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#B45309]" />
            )}
            <span>
              {language === 'te'
                ? `${mandatoryCount} లో ${mandatoryUploadedCount} పత్రాలు అప్‌లోడ్ అయ్యాయి`
                : `${mandatoryUploadedCount} of ${mandatoryCount} Mandatory Uploaded`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-[#64748B]">
            <span>Upload Progress</span>
            <span className="font-bold text-[#101828]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isComplete ? 'bg-[#15803D]' : 'bg-[#2563EB]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Accepted File Guidance */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 text-[11px] text-[#64748B]">
          <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
          <span>Accepted formats: PDF, JPG, PNG &bull; Maximum file size: 5 MB per document</span>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-[#B91C1C] flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#B91C1C]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-[#15803D] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15803D]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* DOCUMENT CARDS LIST */}
      <div className="space-y-3">
        {checklist.map((item) => {
          const isUploading = uploadingTypeId === item.requiredDocumentTypeId;
          const maxMb = (item.maxSizeBytes / (1024 * 1024)).toFixed(0);

          return (
            <div
              key={item.requiredDocumentTypeId}
              className={`p-5 rounded-2xl border transition-all ${
                item.uploaded
                  ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                  : item.required
                  ? 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Document Metadata */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-[#101828]">
                      {language === 'te' && item.nameTe ? item.nameTe : item.nameEn}
                    </span>
                    {item.required ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#B91C1C] border border-rose-200">
                        * {language === 'te' ? 'తప్పనిసరి' : 'Mandatory'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-[#64748B]">
                        {language === 'te' ? 'ఐచ్ఛికం' : 'Optional'}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#64748B] flex items-center gap-2 flex-wrap">
                    <span>
                      {language === 'te' ? 'అనుమతించబడినవి: ' : 'Format: '}{' '}
                      <span className="font-mono text-[11px] font-bold text-[#0F172A]">
                        {item.acceptedMimeTypes.replace(/image\/|application\//g, '').toUpperCase()}
                      </span>
                    </span>
                    <span>&bull;</span>
                    <span>Max: {maxMb} MB</span>
                  </div>

                  {item.uploaded && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#15803D]">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{item.fileName}</span>
                      {item.fileSizeBytes && (
                        <span className="text-slate-400 font-normal">
                          ({(item.fileSizeBytes / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Document Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  {item.uploaded && item.previewUrl && (
                    <a
                      href={item.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-[#EAF2FF] text-[#2563EB] hover:bg-blue-100 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'చూడండి' : 'Preview'}</span>
                    </a>
                  )}

                  {canEdit && (
                    <>
                      <input
                        type="file"
                        ref={(el) => (fileInputRefs.current[item.requiredDocumentTypeId] = el)}
                        className="hidden"
                        accept={item.acceptedMimeTypes}
                        onChange={(e) => handleFileChange(item.requiredDocumentTypeId, e)}
                      />

                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRefs.current[item.requiredDocumentTypeId]?.click()}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isUploading
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : item.uploaded
                            ? 'bg-white border border-slate-300 text-[#0F172A] hover:bg-slate-50'
                            : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-xs'
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : item.uploaded ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{language === 'te' ? 'మార్చు' : 'Replace'}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>{language === 'te' ? 'అప్‌లోడ్' : 'Upload File'}</span>
                          </>
                        )}
                      </button>

                      {item.uploaded && item.documentId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.documentId!)}
                          className="p-2 text-[#B91C1C] hover:bg-rose-50 rounded-xl transition"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
