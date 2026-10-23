package com.licensing.platform.ocr;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.licensing.platform.model.ApplicationDocument;
import com.licensing.platform.model.OcrExtraction;
import com.licensing.platform.repository.OcrExtractionRepository;
import com.licensing.platform.service.DocumentStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.util.Optional;

@Service
@Transactional
public class OcrOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(OcrOrchestratorService.class);

    private final RuleBasedDocumentParser documentParser;
    private final DocumentStorageService storageService;
    private final OcrExtractionRepository ocrExtractionRepository;
    private final ObjectMapper objectMapper;

    public OcrOrchestratorService(RuleBasedDocumentParser documentParser,
                                  DocumentStorageService storageService,
                                  OcrExtractionRepository ocrExtractionRepository,
                                  ObjectMapper objectMapper) {
        this.documentParser = documentParser;
        this.storageService = storageService;
        this.ocrExtractionRepository = ocrExtractionRepository;
        this.objectMapper = objectMapper;
    }

    public OcrExtraction processDocument(ApplicationDocument document) {
        Path filePath = storageService.getRootStorageLocation().resolve(document.getStorageKey()).normalize();

        OcrResult result = documentParser.extract(
                filePath,
                document.getContentType(),
                document.getDocumentType().getDocumentCode()
        );

        String fieldsJson = "{}";
        try {
            fieldsJson = objectMapper.writeValueAsString(result.getExtractedFields());
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize extracted fields to JSON", e);
        }

        Optional<OcrExtraction> existingOpt = ocrExtractionRepository.findByDocumentId(document.getId());
        OcrExtraction extraction;
        if (existingOpt.isPresent()) {
            extraction = existingOpt.get();
            extraction.setEngineName(result.getEngineName());
            extraction.setEngineVersion(result.getEngineVersion());
            extraction.setRawText(result.getRawText());
            extraction.setExtractedFields(fieldsJson);
            extraction.setConfidenceScore(result.getConfidenceScore());
            extraction.setProcessingStatus(result.getProcessingStatus());
        } else {
            extraction = new OcrExtraction(
                    document,
                    result.getEngineName(),
                    result.getEngineVersion(),
                    result.getRawText(),
                    fieldsJson,
                    result.getConfidenceScore(),
                    result.getProcessingStatus()
            );
        }

        OcrExtraction saved = ocrExtractionRepository.save(extraction);
        log.info("Saved OCR extraction ID {} for document ID {} with confidence {}",
                saved.getId(), document.getId(), saved.getConfidenceScore());
        return saved;
    }
}
