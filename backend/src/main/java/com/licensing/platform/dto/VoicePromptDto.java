package com.licensing.platform.dto;

import java.util.List;

public class VoicePromptDto {

    private String fieldKey;
    private String label;
    private String spokenPrompt;
    private String spokenExample;
    private String dataType;
    private boolean isRequired;
    private String readbackTemplate;
    private List<String> options;
    private String validationHint;

    public VoicePromptDto() {
    }

    public VoicePromptDto(String fieldKey, String label, String spokenPrompt, String spokenExample,
                          String dataType, boolean isRequired, String readbackTemplate,
                          List<String> options, String validationHint) {
        this.fieldKey = fieldKey;
        this.label = label;
        this.spokenPrompt = spokenPrompt;
        this.spokenExample = spokenExample;
        this.dataType = dataType;
        this.isRequired = isRequired;
        this.readbackTemplate = readbackTemplate;
        this.options = options;
        this.validationHint = validationHint;
    }

    public String getFieldKey() {
        return fieldKey;
    }

    public void setFieldKey(String fieldKey) {
        this.fieldKey = fieldKey;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getSpokenPrompt() {
        return spokenPrompt;
    }

    public void setSpokenPrompt(String spokenPrompt) {
        this.spokenPrompt = spokenPrompt;
    }

    public String getSpokenExample() {
        return spokenExample;
    }

    public void setSpokenExample(String spokenExample) {
        this.spokenExample = spokenExample;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public boolean isRequired() {
        return isRequired;
    }

    public void setRequired(boolean required) {
        isRequired = required;
    }

    public String getReadbackTemplate() {
        return readbackTemplate;
    }

    public void setReadbackTemplate(String readbackTemplate) {
        this.readbackTemplate = readbackTemplate;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getValidationHint() {
        return validationHint;
    }

    public void setValidationHint(String validationHint) {
        this.validationHint = validationHint;
    }
}
