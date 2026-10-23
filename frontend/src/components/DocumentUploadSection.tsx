import React, { useState, useEffect, useRef } from 'react';
import { DocumentChecklistStatus } from '../types/document';
import { documentApi } from '../services/documentApi';

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
      setSuccessMsg(language === 'te' ? 'పత్రం విజయవంతంగా అప్‌లోడ్ చేయబడింది' : 'Document uploaded successfully');
      await fetchChecklist();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setUploadingTypeId(null);
      if (fileInputRefs.current[typeId]) {
        fileInputRefs.current[typeId]!.value = '';
      }
    }
  };

  const handleDelete = async (docId: number) => {
    if (!window.confirm(language === 'te' ? 'ఈ పత్రాన్ని తొలగించాలనుకుంటున్నారా?' : 'Delete this document?')) {
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      await documentApi.deleteDocument(applicationId, docId);
      setSuccessMsg(language === 'te' ? 'పత్రం తొలగించబడింది' : 'Document deleted successfully');
      await fetchChecklist();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete failed');
    }
  };

  const mandatoryCount = checklist.filter((item) => item.required).length;
  const mandatoryUploadedCount = checklist.filter((item) => item.required && item.uploaded).length;
  const isComplete = mandatoryCount > 0 && mandatoryUploadedCount === mandatoryCount;

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
        {language === 'te' ? 'పత్రాల జాబితా లోడ్ అవుతోంది...' : 'Loading document checklist...'}
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem', margin: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>
            {language === 'te' ? 'సహాయక పత్రాల అప్‌లోడ్' : 'Supporting Documents Checklist'}
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#4b5563' }}>
            {language === 'te'
              ? 'ధృవీకరణ కోసం అవసరమైన పత్రాలను సురక్షితంగా అప్‌లోడ్ చేయండి'
              : 'Securely upload required supporting proofs for departmental verification'}
          </p>
        </div>
        <div
          style={{
            padding: '0.375rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: isComplete ? '#d1fae5' : '#fef3c7',
            color: isComplete ? '#065f46' : '#92400e',
          }}
        >
          {language === 'te'
            ? `${mandatoryCount} లో ${mandatoryUploadedCount} తప్పనిసరి పత్రాలు సిద్ధం`
            : `${mandatoryUploadedCount} of ${mandatoryCount} Mandatory Uploaded`}
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            background: '#fee2e2',
            color: '#991b1b',
            fontSize: '0.875rem',
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            background: '#ecfdf5',
            color: '#065f46',
            fontSize: '0.875rem',
          }}
        >
          ✓ {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {checklist.map((item) => {
          const isUploading = uploadingTypeId === item.requiredDocumentTypeId;
          const maxMb = (item.maxSizeBytes / (1024 * 1024)).toFixed(1);

          return (
            <div
              key={item.requiredDocumentTypeId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '6px',
                border: item.uploaded ? '1px solid #10b981' : '1px solid #e5e7eb',
                background: item.uploaded ? '#f0fdf4' : '#fafafa',
              }}
            >
              <div style={{ flex: 1, marginRight: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1f2937' }}>
                    {language === 'te' ? item.nameTe : item.nameEn}
                  </span>
                  {item.required ? (
                    <span
                      style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}
                    >
                      {language === 'te' ? 'తప్పనిసరి' : 'REQUIRED'}
                    </span>
                  ) : (
                    <span
                      style={{
                        background: '#f3f4f6',
                        color: '#4b5563',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                      }}
                    >
                      {language === 'te' ? 'ఐచ్ఛికం' : 'OPTIONAL'}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  <span>{language === 'te' ? 'ఫార్మాట్లు: ' : 'Accepted: '} {item.acceptedMimeTypes.replace(/image\/|application\//g, '').toUpperCase()}</span>
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  <span>{language === 'te' ? 'గరిష్ట పరిమాణం: ' : 'Max: '} {maxMb} MB</span>
                </div>

                {item.uploaded && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>✓ {item.fileName}</span>
                    {item.fileSizeBytes && (
                      <span style={{ color: '#6b7280' }}>({(item.fileSizeBytes / 1024).toFixed(1)} KB)</span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.uploaded && item.previewUrl && (
                  <a
                    href={item.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                    }}
                  >
                    {language === 'te' ? 'పరిశీలించు' : 'Preview'}
                  </a>
                )}

                {item.uploaded && item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    download
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      background: '#f3f4f6',
                      color: '#374151',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                    }}
                  >
                    {language === 'te' ? 'డౌన్‌లోడ్' : 'Download'}
                  </a>
                )}

                {canEdit && (
                  <>
                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[item.requiredDocumentTypeId] = el)}
                      style={{ display: 'none' }}
                      accept={item.acceptedMimeTypes}
                      onChange={(e) => handleFileChange(item.requiredDocumentTypeId, e)}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRefs.current[item.requiredDocumentTypeId]?.click()}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        background: item.uploaded ? '#f9fafb' : '#2563eb',
                        color: item.uploaded ? '#374151' : '#ffffff',
                        border: item.uploaded ? '1px solid #d1d5db' : 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isUploading
                        ? language === 'te' ? 'అప్‌లోడ్...' : 'Uploading...'
                        : item.uploaded
                        ? language === 'te' ? 'మార్చండి' : 'Replace'
                        : language === 'te' ? 'అప్‌లోడ్ చేయండి' : 'Upload'}
                    </button>

                    {item.uploaded && item.documentId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.documentId!)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                        title={language === 'te' ? 'తొలగించు' : 'Remove document'}
                      >
                        ✕
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
