package com.licensing.platform.ocr;

import java.math.BigDecimal;
import java.util.Map;

public class OcrResult {

    private final String engineName;
    private final String engineVersion;
    private final String rawText;
    private final Map<String, String> extractedFields;
    private final BigDecimal confidenceScore;
    private final String processingStatus;

    public OcrResult(String engineName, String engineVersion, String rawText,
                     Map<String, String> extractedFields, BigDecimal confidenceScore, String processingStatus) {
        this.engineName = engineName;
        this.engineVersion = engineVersion;
        this.rawText = rawText;
        this.extractedFields = extractedFields;
        this.confidenceScore = confidenceScore;
        this.processingStatus = processingStatus;
    }

    public String getEngineName() {
        return engineName;
    }

    public String getEngineVersion() {
        return engineVersion;
    }

    public String getRawText() {
        return rawText;
    }

    public Map<String, String> getExtractedFields() {
        return extractedFields;
    }

    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }

    public String getProcessingStatus() {
        return processingStatus;
    }
}
