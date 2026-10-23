package com.licensing.platform.dto;

import jakarta.validation.constraints.NotBlank;

public class VoiceNormalizationRequest {

    private String fieldKey;

    @NotBlank(message = "rawTranscript cannot be blank")
    private String rawTranscript;

    private String language = "en";

    private String dataType = "TEXT";

    public VoiceNormalizationRequest() {
    }

    public VoiceNormalizationRequest(String fieldKey, String rawTranscript, String language, String dataType) {
        this.fieldKey = fieldKey;
        this.rawTranscript = rawTranscript;
        this.language = language;
        this.dataType = dataType;
    }

    public String getFieldKey() {
        return fieldKey;
    }

    public void setFieldKey(String fieldKey) {
        this.fieldKey = fieldKey;
    }

    public String getRawTranscript() {
        return rawTranscript;
    }

    public void setRawTranscript(String rawTranscript) {
        this.rawTranscript = rawTranscript;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }
}
