package com.licensing.platform.dto;

import java.util.List;

public class VoiceServiceGuidanceResponse {

    private String serviceCode;
    private String serviceName;
    private String language;
    private String welcomePrompt;
    private String completionPrompt;
    private String errorPrompt;
    private List<VoicePromptDto> fields;

    public VoiceServiceGuidanceResponse() {
    }

    public VoiceServiceGuidanceResponse(String serviceCode, String serviceName, String language,
                                        String welcomePrompt, String completionPrompt, String errorPrompt,
                                        List<VoicePromptDto> fields) {
        this.serviceCode = serviceCode;
        this.serviceName = serviceName;
        this.language = language;
        this.welcomePrompt = welcomePrompt;
        this.completionPrompt = completionPrompt;
        this.errorPrompt = errorPrompt;
        this.fields = fields;
    }

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getWelcomePrompt() {
        return welcomePrompt;
    }

    public void setWelcomePrompt(String welcomePrompt) {
        this.welcomePrompt = welcomePrompt;
    }

    public String getCompletionPrompt() {
        return completionPrompt;
    }

    public void setCompletionPrompt(String completionPrompt) {
        this.completionPrompt = completionPrompt;
    }

    public String getErrorPrompt() {
        return errorPrompt;
    }

    public void setErrorPrompt(String errorPrompt) {
        this.errorPrompt = errorPrompt;
    }

    public List<VoicePromptDto> getFields() {
        return fields;
    }

    public void setFields(List<VoicePromptDto> fields) {
        this.fields = fields;
    }
}
