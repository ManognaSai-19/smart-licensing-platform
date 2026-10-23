package com.licensing.platform.dto;

import java.util.Map;

public class UpdateDraftRequest {

    private Map<String, Object> formData;

    private String languagePreference;

    public UpdateDraftRequest() {
    }

    public UpdateDraftRequest(Map<String, Object> formData, String languagePreference) {
        this.formData = formData;
        this.languagePreference = languagePreference;
    }

    public Map<String, Object> getFormData() {
        return formData;
    }

    public void setFormData(Map<String, Object> formData) {
        this.formData = formData;
    }

    public String getLanguagePreference() {
        return languagePreference;
    }

    public void setLanguagePreference(String languagePreference) {
        this.languagePreference = languagePreference;
    }
}
